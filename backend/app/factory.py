from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from fastapi.routing import APIRoute
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import FileResponse

from app.api import (
    admins,
    authentications,
    banners,
    carts,
    categories,
    homes,
    orders,
    products,
    searches,
    users,
    wishlists,
)
from app.core.config import settings
from app.core.logger import logger
from app.db import SessionLocal, async_session_maker


def create_app():
    description = f"{settings.PROJECT_NAME} API"
    app = FastAPI(
        title=settings.PROJECT_NAME,
        servers=[{"url": settings.REACT_APP_BACKEND_URL}],
        openapi_url=f"{settings.API_PATH}/openapi.json",
        docs_url="/swagger",
        description=description,
        version=settings.VERSION,
        redoc_url="/redoc",
    )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request, exc):
        return JSONResponse(
            status_code=exc.status_code,
            content={"message": exc.detail},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request, exc):
        if hasattr(exc, "detail"):
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"message": exc.detail},
            )
        else:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"message": exc.errors()},
            )

    setup_routers(app)
    init_db_hooks(app)
    setup_cors_middleware(app)
    setup_gzip_middleware(app)
    serve_static_app(app)

    return app


def setup_routers(app: FastAPI) -> None:
    app.include_router(
        authentications.router,
        prefix=f"{settings.API_PATH}",
        tags=["Authentication"],
    )
    app.include_router(
        users.router,
        prefix=f"{settings.API_PATH}/user",
        tags=["User"],
    )
    app.include_router(
        wishlists.router,
        prefix=f"{settings.API_PATH}/wishlist",
        tags=["Wishlist"],
    )
    app.include_router(
        searches.router,
        prefix=f"{settings.API_PATH}",
        tags=["Search"],
    )
    app.include_router(
        homes.router,
        prefix=f"{settings.API_PATH}/home",
        tags=["Home"],
    )
    app.include_router(
        banners.router,
        prefix=f"{settings.API_PATH}/banners",
        tags=["Banner"],
    )
    app.include_router(
        products.router,
        prefix=f"{settings.API_PATH}/products",
        tags=["Product"],
    )
    app.include_router(
        categories.router,
        prefix=f"{settings.API_PATH}/categories",
        tags=["Category"],
    )
    app.include_router(
        carts.router,
        prefix=f"{settings.API_PATH}/cart",
        tags=["Cart"],
    )
    app.include_router(
        orders.router,
        prefix=f"{settings.API_PATH}",
        tags=["Order"],
    )
    app.include_router(
        admins.router,
        prefix=f"{settings.API_PATH}/admin",
        tags=["Dashboard"],
    )

    # The following operation needs to be at the end of this function
    use_route_names_as_operation_ids(app)


def serve_static_app(app):
    app.mount("/", StaticFiles(directory="static"), name="static")
    templates = Jinja2Templates(directory="static")

    @app.middleware("http")
    async def _add_404_middleware(request: Request, call_next):
        """Serves static assets on 404"""
        response = await call_next(request)
        path = request["path"]
        if path.startswith(settings.API_PATH):
            return response
        if response.status_code == 404:
            # remove path and query string
            return templates.TemplateResponse(
                "index.html",
                {"request": request, "host": settings.REACT_APP_BACKEND_URL},
            )
        return response


def setup_cors_middleware(app):
    if settings.BACKEND_CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            expose_headers=["Content-Range", "Range"],
            allow_headers=["Authorization", "Range", "Content-Range"],
        )


def setup_gzip_middleware(app):
    app.add_middleware(GZipMiddleware, minimum_size=500)


def use_route_names_as_operation_ids(app: FastAPI) -> None:
    """
    Simplify operation IDs so that generated API clients have simpler function
    names.

    Should be called only after all routes have been added.
    """
    route_names = set()
    for route in app.routes:
        if isinstance(route, APIRoute):
            if route.name in route_names:
                raise Exception("Route function names should be unique")
            route.operation_id = route.name
            route_names.add(route.name)


def init_db_hooks(app: FastAPI) -> None:
    from sqlalchemy import event
    from sqlalchemy.orm.query import Query

    from app.db import database

    @event.listens_for(
        Query, "before_compile", retval=True, bake_ok=True, propagate=True
    )
    def no_deleted(query):
        query._enable_assertions = False
        for desc in query.column_descriptions:
            entity = desc["entity"]
            if entity:
                query = query.filter(entity.deleted_at.is_(None))
        return query

    @app.on_event("startup")
    async def startup():
        await database.connect()

    @app.on_event("shutdown")
    async def shutdown():
        await database.disconnect()
