package com.resello_mobile

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Bundle
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.gms.auth.api.phone.SmsRetriever
import com.google.android.gms.common.api.CommonStatusCodes
import com.google.android.gms.common.api.Status

/**
 * Wraps the SMS User Consent API: Play services watches for one incoming OTP-like SMS and, after
 * the user taps Allow on the system sheet, hands us its text. Needs no READ_SMS permission and no
 * app hash in the message.
 */
class SmsUserConsentModule(private val context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context), ActivityEventListener {

  private var pending: Promise? = null
  private var receiver: BroadcastReceiver? = null

  init {
    context.addActivityEventListener(this)
  }

  override fun getName() = NAME

  /** Resolves with the SMS text, or null if denied, timed out (5 min), or stopped. */
  @ReactMethod
  @Synchronized
  fun waitForSms(promise: Promise) {
    finish(null)
    pending = promise
    receiver =
        object : BroadcastReceiver() {
          override fun onReceive(receiverContext: Context, intent: Intent) = onSmsRetrieved(intent)
        }
    // SEND_PERMISSION restricts this exported receiver to Play services.
    ContextCompat.registerReceiver(
        context,
        receiver,
        IntentFilter(SmsRetriever.SMS_RETRIEVED_ACTION),
        SmsRetriever.SEND_PERMISSION,
        null,
        ContextCompat.RECEIVER_EXPORTED,
    )
    SmsRetriever.getClient(context).startSmsUserConsent(null).addOnFailureListener { finish(null) }
  }

  @ReactMethod
  fun stop() = finish(null)

  override fun invalidate() {
    context.removeActivityEventListener(this)
    finish(null)
    super.invalidate()
  }

  @Suppress("DEPRECATION")
  private fun onSmsRetrieved(intent: Intent) {
    val extras: Bundle = intent.extras ?: return finish(null)
    val status = extras.getParcelable<Status>(SmsRetriever.EXTRA_STATUS)
    val consentIntent = extras.getParcelable<Intent>(SmsRetriever.EXTRA_CONSENT_INTENT)
    val activity = context.currentActivity
    if (status?.statusCode != CommonStatusCodes.SUCCESS ||
        consentIntent == null ||
        activity == null) {
      return finish(null)
    }
    try {
      activity.startActivityForResult(consentIntent, REQUEST_CODE)
    } catch (_: RuntimeException) {
      finish(null)
    }
  }

  override fun onActivityResult(
      activity: Activity,
      requestCode: Int,
      resultCode: Int,
      data: Intent?,
  ) {
    if (requestCode != REQUEST_CODE) {
      return
    }
    finish(
        if (resultCode == Activity.RESULT_OK) data?.getStringExtra(SmsRetriever.EXTRA_SMS_MESSAGE)
        else null)
  }

  override fun onNewIntent(intent: Intent) = Unit

  @Synchronized
  private fun finish(message: String?) {
    receiver?.let { context.unregisterReceiver(it) }
    receiver = null
    pending?.resolve(message)
    pending = null
  }

  companion object {
    const val NAME = "SmsUserConsent"
    private const val REQUEST_CODE = 24601
  }
}
