from pathlib import Path

from django.http import HttpResponse

OPENAPI_FILE = Path(__file__).resolve().parent / "openapi.json"

SWAGGER_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>PharmaMap API — Swagger</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: "/api/schema/",
      dom_id: "#swagger-ui",
      deepLinking: true
    });
  </script>
</body>
</html>
"""

REDOC_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>PharmaMap API — Redoc</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <redoc spec-url="/api/schema/"></redoc>
  <script src="https://cdn.jsdelivr.net/npm/redoc@2/bundles/redoc.standalone.js"></script>
</body>
</html>
"""


def openapi_schema(request):
    return HttpResponse(
        OPENAPI_FILE.read_text(encoding="utf-8"),
        content_type="application/json",
    )


def swagger_ui(request):
    return HttpResponse(SWAGGER_HTML, content_type="text/html")


def redoc(request):
    return HttpResponse(REDOC_HTML, content_type="text/html")
