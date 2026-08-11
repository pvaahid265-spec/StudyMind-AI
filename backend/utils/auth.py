from datetime import datetime, timedelta, timezone

import os

from dotenv import load_dotenv

from jose import JWTError, jwt


# =========================================================
# LOAD ENVIRONMENT
# =========================================================

load_dotenv()


# =========================================================
# JWT CONFIGURATION
# =========================================================

SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY"
)

if not SECRET_KEY:
    SECRET_KEY = os.getenv(
        "SECRET_KEY"
    )

if not SECRET_KEY:
    raise RuntimeError(
        "JWT_SECRET_KEY is not configured in .env"
    )


ALGORITHM = os.getenv(
    "JWT_ALGORITHM",
    "HS256"
)


ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "60"
    )
)


# =========================================================
# CREATE ACCESS TOKEN
# =========================================================

def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None
):

    payload = data.copy()

    if expires_delta:
        expire = (
            datetime.now(timezone.utc)
            + expires_delta
        )
    else:
        expire = (
            datetime.now(timezone.utc)
            + timedelta(
                minutes=ACCESS_TOKEN_EXPIRE_MINUTES
            )
        )

    payload.update(
        {
            "exp": expire,
            "iat": datetime.now(
                timezone.utc
            )
        }
    )

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# =========================================================
# VERIFY ACCESS TOKEN
# =========================================================

def verify_access_token(token: str):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = payload.get(
            "email"
        )

        if not email:
            return None

        return email.strip().lower()

    except JWTError as e:

        print(
            "JWT Verification Error:",
            str(e)
        )

        return None

    except Exception as e:

        print(
            "Token Error:",
            str(e)
        )

        return None