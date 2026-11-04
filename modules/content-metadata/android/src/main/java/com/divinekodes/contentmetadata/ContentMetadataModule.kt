package com.divinekodes.contentmetadata

import android.content.ContentResolver
import android.net.Uri
import android.provider.OpenableColumns
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ContentMetadataModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ContentMetadata")

    /**
     * Query metadata while Android's temporary VIEW-intent URI grant is alive.
     * Providers may omit any field, so every returned value is nullable.
     */
    AsyncFunction("getMetadataAsync") { uriString: String ->
      val context = appContext.reactContext
        ?: throw IllegalStateException("React context is unavailable")
      val uri = Uri.parse(uriString)

      if (uri.scheme != ContentResolver.SCHEME_CONTENT) {
        return@AsyncFunction mapOf<String, Any?>(
          "displayName" to null,
          "mimeType" to null,
          "size" to null
        )
      }

      var displayName: String? = null
      var size: Long? = null
      val projection = arrayOf(
        OpenableColumns.DISPLAY_NAME,
        OpenableColumns.SIZE
      )

      context.contentResolver.query(uri, projection, null, null, null)?.use { cursor ->
        if (cursor.moveToFirst()) {
          val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
          if (nameIndex >= 0 && !cursor.isNull(nameIndex)) {
            displayName = cursor.getString(nameIndex)
          }

          val sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE)
          if (sizeIndex >= 0 && !cursor.isNull(sizeIndex)) {
            size = cursor.getLong(sizeIndex)
          }
        }
      }

      mapOf<String, Any?>(
        "displayName" to displayName,
        "mimeType" to context.contentResolver.getType(uri),
        "size" to size
      )
    }
  }
}
