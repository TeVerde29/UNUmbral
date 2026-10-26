package com.teverde.unumbral;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import com.getcapacitor.BridgeActivity;
import java.io.OutputStream;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().addJavascriptInterface(new UNUmbralAndroidBridge(), "UNUmbralNative");
        }
    }

    public class UNUmbralAndroidBridge {
        @JavascriptInterface
        public boolean saveQrImage(String base64Data, String fileName) {
            try {
                if (base64Data == null || base64Data.isEmpty()) return false;
                String cleanBase64 = base64Data;
                int commaIdx = cleanBase64.indexOf(',');
                if (commaIdx >= 0) {
                    cleanBase64 = cleanBase64.substring(commaIdx + 1);
                }
                byte[] bytes = Base64.decode(cleanBase64, Base64.DEFAULT);
                String safeName = (fileName != null && !fileName.isEmpty()) ? fileName : ("UNUmbral_QR_" + System.currentTimeMillis() + ".png");
                if (!safeName.toLowerCase().endsWith(".png")) {
                    safeName += ".png";
                }

                ContentResolver resolver = getContentResolver();
                ContentValues values = new ContentValues();
                values.put(MediaStore.Images.Media.DISPLAY_NAME, safeName);
                values.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    values.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/UNUmbral");
                    values.put(MediaStore.Images.Media.IS_PENDING, 1);
                }

                Uri uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
                if (uri == null) return false;

                try (OutputStream os = resolver.openOutputStream(uri)) {
                    if (os == null) return false;
                    os.write(bytes);
                    os.flush();
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    values.clear();
                    values.put(MediaStore.Images.Media.IS_PENDING, 0);
                    resolver.update(uri, values, null, null);
                }
                return true;
            } catch (Exception e) {
                e.printStackTrace();
                return false;
            }
        }
    }
}
