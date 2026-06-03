
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from inference import hybrid_recommendation


app = FastAPI(
    title="Hybrid Recommendation API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():

    return {
        "message": "Hybrid Recommendation API Running"
    }


@app.get("/recommend/{product_id}")
def recommend_product(
    product_id: str,
    top_n: int = 5
):

    recommendations = hybrid_recommendation(
        product_id,
        top_n
    )

    return {

        "input_product": product_id,

        "total_recommendation": len(recommendations),

        "recommendations": recommendations
    }

@app.get("/health")
def health_check():

    return {
        "status": "healthy"
    }  