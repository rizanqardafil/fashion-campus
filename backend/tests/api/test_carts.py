import uuid

from sqlalchemy.orm.session import Session
from starlette.testclient import TestClient

from app.core.config import settings
from tests.utils import get_jwt_header

prefix = f"{settings.API_PATH}/cart"


def test_get_empty_cart(client: TestClient, create_user):
    user = create_user()

    resp = client.get(f"{prefix}", headers=get_jwt_header(user))
    assert resp.status_code == 404
    assert resp.json() == {"message": "You have no carts"}


def test_get_cart(
    client: TestClient,
    create_user,
    create_cart,
    create_product,
    create_size,
    create_product_size_quantity,
):
    user = create_user()
    product = create_product()
    size = create_size()
    product_size_quantity = create_product_size_quantity(product, size)
    cart = create_cart(user, product_size_quantity)

    resp = client.get(f"{prefix}", headers=get_jwt_header(user))
    assert resp.status_code == 200
    data = resp.json().get("data")
    assert data[0]["id"] == str(cart.id)


def test_create_cart(
    client: TestClient,
    create_user,
    create_product,
    create_size,
    create_product_size_quantity,
):
    user = create_user()
    product = create_product()
    size = create_size()
    create_product_size_quantity(product, size)

    resp = client.post(
        f"{prefix}",
        headers=get_jwt_header(user),
        json={"product_id": str(product.id), "quantity": "1", "size": str(size.size)},
    )
    data = resp.json()
    assert data["message"] == "Added to cart"
    assert resp.status_code == 201


def test_create_cart_wrong_product_id(
    client: TestClient,
    create_user,
    create_product,
    create_size,
    create_product_size_quantity,
):
    user = create_user()
    product = create_product()
    size = create_size()
    create_product_size_quantity(product, size)
    product_id = uuid.uuid4()

    resp = client.post(
        f"{prefix}",
        headers=get_jwt_header(user),
        json={"product_id": str(product_id), "quantity": "1", "size": str(size.size)},
    )
    data = resp.json()
    assert data["message"].startswith("Product ID")
    assert resp.status_code == 400


def test_create_cart_reduce_quantity(
    client: TestClient,
    create_user,
    create_product,
    create_size,
    db: Session,
):
    user = create_user()
    product = create_product()
    size = create_size()

    db.execute(
        """
        INSERT INTO product_size_quantities (product_id, size_id, quantity)
        VALUES (:product_id, :size_id, :quantity)
        """,
        {
            "product_id": product.id,
            "size_id": size.id,
            "quantity": 1,
        },
    )
    db.commit()

    resp = client.post(
        f"{prefix}",
        headers=get_jwt_header(user),
        json={
            "product_id": str(product.id),
            "quantity": 5,
            "size": str(size.size),
        },
    )

    assert resp.status_code == 400
    assert resp.json()["message"].startswith("Out of stock")


def test_create_existed_cart_reduce_quantity(
    client: TestClient,
    create_user,
    create_product,
    create_size,
    db: Session,
    create_cart,
):
    user = create_user()
    product = create_product()
    size = create_size()

    db.execute(
        """
        INSERT INTO product_size_quantities (product_id, size_id, quantity)
        VALUES (:product_id, :size_id, :quantity)
        """,
        {
            "product_id": product.id,
            "size_id": size.id,
            "quantity": 1,
        },
    )
    db.commit()

    product_size_quantity = db.execute(
        """
        SELECT * FROM product_size_quantities
        WHERE product_id = :product_id AND size_id = :size_id
        """,
        {
            "product_id": product.id,
            "size_id": size.id,
        },
    ).fetchone()

    create_cart(user, product_size_quantity)

    resp = client.post(
        f"{prefix}",
        headers=get_jwt_header(user),
        json={
            "product_id": str(product.id),
            "quantity": 5,
            "size": str(size.size),
        },
    )

    assert resp.status_code == 400
    assert resp.json()["message"].startswith("Out of stock")


def test_create_existed_cart(
    client: TestClient,
    create_user,
    create_product,
    create_size,
    db: Session,
    create_cart,
):
    user = create_user()
    product = create_product()
    size = create_size()

    db.execute(
        """
        INSERT INTO product_size_quantities (product_id, size_id, quantity)
        VALUES (:product_id, :size_id, :quantity)
        """,
        {
            "product_id": product.id,
            "size_id": size.id,
            "quantity": 10,
        },
    )
    db.commit()

    product_size_quantity = db.execute(
        """
        SELECT * FROM product_size_quantities
        WHERE product_id = :product_id AND size_id = :size_id
        """,
        {
            "product_id": product.id,
            "size_id": size.id,
        },
    ).fetchone()

    create_cart(user, product_size_quantity)

    resp = client.post(
        f"{prefix}",
        headers=get_jwt_header(user),
        json={
            "product_id": str(product.id),
            "quantity": 5,
            "size": str(size.size),
        },
    )

    assert resp.status_code == 201
    assert resp.json()["message"] == "Added to cart"


def test_update_non_existed_cart(
    client: TestClient,
    create_user,
    create_cart,
    create_product,
    create_size,
    create_product_size_quantity,
):
    user = create_user()
    product = create_product()
    size = create_size()
    create_product_size_quantity(product, size)

    resp = client.put(
        f"{prefix}",
        headers=get_jwt_header(user),
        json={"id": str(uuid.uuid4()), "quantity": "2"},
    )
    data = resp.json()
    assert data["message"] == "Cart not found"
    assert resp.status_code == 404


def test_update_cart_with_invalid_quantity(
    client: TestClient,
    create_user,
    create_cart,
    create_product,
    create_size,
    create_product_size_quantity,
    db: Session,
):
    user = create_user()
    product = create_product()
    size = create_size()
    # product_size_quantity = create_product_size_quantity(product, size)
    db.execute(
        """
        INSERT INTO product_size_quantities (product_id, size_id, quantity)
        VALUES (:product_id, :size_id, :quantity)
        """,
        {
            "product_id": product.id,
            "size_id": size.id,
            "quantity": 1,
        },
    )
    db.commit()
    product_size_quantity = db.execute(
        """
        SELECT * FROM product_size_quantities
        WHERE product_id = :product_id AND size_id = :size_id
        """,
        {
            "product_id": product.id,
            "size_id": size.id,
        },
    ).fetchone()

    cart = create_cart(user, product_size_quantity)

    resp = client.put(
        f"{prefix}",
        headers=get_jwt_header(user),
        json={"id": str(cart.id), "quantity": 100},
    )
    data = resp.json()
    assert data["message"].startswith("Out of stock")
    assert resp.status_code == 400


def test_update_cart(
    client: TestClient,
    create_user,
    create_cart,
    create_product,
    create_size,
    create_product_size_quantity,
):
    user = create_user()
    product = create_product()
    size = create_size()
    product_size_quantity = create_product_size_quantity(product, size)
    cart = create_cart(user, product_size_quantity)

    resp = client.put(
        f"{prefix}",
        headers=get_jwt_header(user),
        json={"id": str(cart.id), "quantity": "2"},
    )
    data = resp.json()
    assert data["message"] == "Cart updated"
    assert resp.status_code == 200


def test_delete_empty_cart(
    client: TestClient,
    create_user,
):
    user = create_user()

    resp = client.delete(
        f"{prefix}",
        headers=get_jwt_header(user),
        params={
            "id": str(uuid.uuid4()),
        },
    )
    assert resp.status_code == 400
    data = resp.json()
    assert data["message"].startswith("Unknown error")


def test_delete_cart(
    client: TestClient,
    create_user,
    create_cart,
    create_product,
    create_size,
    create_product_size_quantity,
):
    user = create_user()
    product = create_product()
    size = create_size()
    product_size_quantity = create_product_size_quantity(product, size)
    cart = create_cart(user, product_size_quantity)

    resp = client.delete(
        f"{prefix}",
        headers=get_jwt_header(user),
        params={
            "id": str(cart.id),
        },
    )
    data = resp.json()
    assert data["message"] == "Cart deleted"
    assert resp.status_code == 200


def test_clear_cart(client: TestClient, create_user):
    user = create_user()

    resp = client.delete(
        f"{prefix}/clear",
        headers=get_jwt_header(user),
    )
    data = resp.json()
    assert data["message"] == "Cart cleared"
    assert resp.status_code == 200


def test_update_cart_minus_quantity(
    client: TestClient,
    create_user,
    create_cart,
    create_product,
    create_size,
    create_product_size_quantity,
):
    user = create_user()
    product = create_product()
    size = create_size()
    product_size_quantity = create_product_size_quantity(product, size)
    cart = create_cart(user, product_size_quantity)

    resp = client.put(
        f"{prefix}",
        headers=get_jwt_header(user),
        json={"id": str(cart.id), "quantity": -100},
    )
    data = resp.json()
    assert data["message"] == "Cart updated"
    assert resp.status_code == 200
