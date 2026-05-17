self.__BUILD_MANIFEST = {
  "__rewrites": {
    "afterFiles": [
      {
        "source": "/api/method/:path*"
      },
      {
        "source": "/api/resource/:path*"
      },
      {
        "source": "/api/file/:path*"
      },
      {
        "source": "/files/:path*"
      },
      {
        "source": "/private/files/:path*"
      }
    ],
    "beforeFiles": [],
    "fallback": []
  },
  "sortedPages": [
    "/_app",
    "/_error"
  ]
};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()