/**
 */
package com.skipo.plugin;

import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaInterface;

import android.media.AudioManager;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.provider.Settings;
import android.content.Context;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class RingtonePlugin extends CordovaPlugin {
  private static final String TAG = "[MyApp]";
  private Ringtone ringtone = null;

  /**
   * Constructor.
   */
  public RingtonePlugin() {
  }

  /**
   * Sets the context of the Command. This can then be used to do things like
   * get file paths associated with the Activity.
   *
   * @param cordova The context of the main Activity.
   * @param webView The CordovaWebView Cordova is running in.
   */
  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);
    AudioManager audioManager = (AudioManager) cordova.getActivity().getApplicationContext().getSystemService(Context.AUDIO_SERVICE);
    boolean speaker = !audioManager.isWiredHeadsetOn() && !audioManager.isBluetoothScoOn();
    audioManager.setMode(AudioManager.MODE_RINGTONE);
    audioManager.setMicrophoneMute(false);
    audioManager.setSpeakerphoneOn(speaker);
    ringtone = RingtoneManager.getRingtone(cordova.getActivity().getApplicationContext(), Settings.System.DEFAULT_RINGTONE_URI);
    Log.v(TAG, "Init RingtonePlugin");
  }

  public boolean execute(String action, JSONArray args, final CallbackContext callbackContext) throws JSONException {
    if ( action.equals("start") ) {
      cordova.getActivity().runOnUiThread(new Runnable() {
        @Override
        public void run() {
          Log.i(TAG, "ringtoneStart");
          ringtone.play();
        }
      });
    } else if ( action.equals("stop") ) {
      cordova.getActivity().runOnUiThread(new Runnable() {
        @Override
        public void run() {
          Log.i(TAG, "ringtoneStop");
          if ( null != ringtone ) {
            ringtone.stop();
            ringtone = null;
          }
        }
      });
    } else {

      return false;
    }

    return true;
  }

}
