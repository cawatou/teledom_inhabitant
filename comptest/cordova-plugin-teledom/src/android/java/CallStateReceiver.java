package io.ionic.starter.app.receiver;

import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.ContentProviderOperation;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.media.AudioManager;
import android.media.session.MediaController;
import android.media.session.MediaSessionManager;
import android.os.Binder;
import android.os.Build;
import android.os.IBinder;
import android.provider.Settings;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.view.KeyEvent;
import android.widget.Toast;

//import com.android.internal.telephony.ITelephony;
import io.ionic.starter.MainActivity;
//import io.ionic.starter.app.service.CallDetachService;
//import io.ionic.starter.app.util.Constants;


import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

//import static android.content.Context.MODE_PRIVATE;
import android.app.Activity;


public class CallStateReceiver extends BroadcastReceiver {
    private static final String TAG = "[MyApp-CSR]";

    private SharedPreferences mSharedPreferences;
    private String callCenterNum;
    private String callCenterFir;
    private String callCenterUfo;
    private boolean callEnabled;
    private ArrayList<ContentProviderOperation> op;

    public CallStateReceiver() {
    }

    @Override
    public void onReceive(final Context context, Intent intent) {
        Log.i(TAG, "*********************************onReceive*******************************************");

        mSharedPreferences = context.getSharedPreferences("NativeStorage", Activity.MODE_PRIVATE);
        callEnabled = true;//mSharedPreferences.getBoolean(Constants.CALL_ENABLED, true);
        callCenterNum = "+" + "78123325307";//mSharedPreferences.getString(Constants.CALL_CENTER_NUMBER, "jopa");
        callCenterFir = "+" + "78126158576";//mSharedPreferences.getString(Constants.CALL_CENTER_NUMBER, "jopa");
        callCenterUfo = "+" + "78126158596";//mSharedPreferences.getString(Constants.CALL_CENTER_NUMBER, "jopa");

        if ( intent.getAction().equals("android.intent.action.PHONE_STATE") ) {
            String state = intent.getStringExtra(TelephonyManager.EXTRA_STATE);
            String number =  intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER);

            Log.i(TAG, "state: " + state + "\nphone: " + number);
            //Toast.makeText(context, "state: " + state + "\nphone: " + number, Toast.LENGTH_SHORT).show();

            if ( state.equals(TelephonyManager.EXTRA_STATE_RINGING) ) {
                if ( number.equals(callCenterNum) || number.equals(callCenterFir) || number.equals(callCenterUfo) ) {
                    Log.i(TAG, "catch callcenter number " + number);

		    SharedPreferences.Editor editor = mSharedPreferences.edit();
                    editor.putString("SIPCENTER", number);
                    editor.commit();
		    mSharedPreferences.getString("SIPCENTER", "jopa");
                    Log.i(TAG, "mSharedPreferences callcenter number " + number);

                    endCall(context);

                    if  ( !callEnabled ) {
                        Log.i(TAG, "Call set disabled");
                        Toast.makeText(context, "Call set disabled", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    
                    Intent i = new Intent(context, MainActivity.class);
                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        i.setAction(Settings.ACTION_MANAGE_OVERLAY_PERMISSION);
                    }
                    context.startActivity(i);
                    
                }

            }

        }

    }

    private void endCall(Context context) {
        Log.w(TAG, "Attempting to deny incoming PSTN call.");

        TelephonyManager tm = (TelephonyManager) context.getSystemService(Context.TELEPHONY_SERVICE);

        try {
            Method getTelephony = tm.getClass().getDeclaredMethod("getITelephony");
            getTelephony.setAccessible(true);
            Object telephonyService = getTelephony.invoke(tm);
            Method endCall = telephonyService.getClass().getDeclaredMethod("endCall");
            endCall.invoke(telephonyService);
            Log.i(TAG, "Denied Incoming Call.");
        } catch (Exception e) {
            Log.e(TAG, "Unable to access ITelephony API", e);
        }

    }


}
