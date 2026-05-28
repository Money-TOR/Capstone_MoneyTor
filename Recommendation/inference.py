import pandas as pd
import numpy as np
import tensorflow as tf
import pickle


@tf.keras.utils.register_keras_serializable()
class DotProductLayer(tf.keras.layers.Layer):

    def call(self, inputs):

        user_vector, product_vector = inputs

        return tf.reduce_sum(
            user_vector * product_vector,
            axis=1,
            keepdims=True
        )

@tf.keras.utils.register_keras_serializable()
def custom_mse(y_true, y_pred):

    return tf.reduce_mean(
        tf.square(y_true - y_pred)
    )


model = tf.keras.models.load_model(

    'model/hybrid_model.keras',

    custom_objects={
        'DotProductLayer': DotProductLayer,
        'custom_mse': custom_mse
    },

    compile=False
)

print("Model Loaded Successfully!")


products = pd.read_csv('model/products.csv')

transactions = pd.read_csv('model/transactions.csv')

logs = pd.read_csv('model/logs.csv')

tfidf = pickle.load(
    open('model/tfidf.pkl', 'rb')
)

cosine_sim = pickle.load(
    open('model/cosine_sim.pkl', 'rb')
)

product_encoder = pickle.load(
    open('model/product_encoder.pkl', 'rb')
)

print("Files Loaded Successfully!")


product_index = pd.Series(

    products.index,

    index=products['id_produk']

).drop_duplicates()


trending_score = transactions.groupby(
    'id_produk'
)['qty'].sum()

trending_score = (
    trending_score /
    trending_score.max()
)


updated_score = logs.groupby(
    'id_produk'
).size()

updated_score = (
    updated_score /
    updated_score.max()
)


product_frequency = transactions.groupby(
    'id_produk'
).size()

product_frequency = (
    product_frequency /
    product_frequency.max()
)


def hybrid_recommendation(
    product_id,
    top_n=5
):


    if product_id not in product_index:

        print("Product Not Found!")

        return []


    idx = product_index[product_id]


    input_product_name = products.iloc[idx]['nama_produk']

    input_category = products.iloc[idx]['kategori_produk']

    print("\n")
    print("=" * 50)
    print("INPUT PRODUCT")
    print("=" * 50)

    print(f"Product ID   : {product_id}")
    print(f"Product Name : {input_product_name}")
    print(f"Category     : {input_category}")


    content_scores = list(
        enumerate(cosine_sim[idx])
    )

    content_scores = sorted(
        content_scores,
        key=lambda x: x[1],
        reverse=True
    )

    # skip itself
    content_scores = content_scores[1:top_n+30]

    recommendations = []


    for i, score in content_scores:

        recommended_category = products.iloc[i]['kategori_produk']

        if recommended_category != input_category:
            continue

        recommended_product_id = products.iloc[i]['id_produk']

        recommended_product_name = products.iloc[i]['nama_produk']

        try:

            encoded_product = product_encoder.transform(
                [recommended_product_id]
            )[0]

            collaborative_score = model.predict(
                [
                    np.array([0]),
                    np.array([encoded_product])
                ],
                verbose=0
            )[0][0]

        except:

            collaborative_score = 0

        trend = trending_score.get(
            recommended_product_id,
            0
        )

        update = updated_score.get(
            recommended_product_id,
            0
        )

        frequency = product_frequency.get(
            recommended_product_id,
            0
        )


        final_score = (

            0.80 * score +

            0.10 * collaborative_score +

            0.05 * trend +

            0.025 * update +

            0.025 * frequency
        )

        recommendations.append({

            "product_id": recommended_product_id,

            "product_name": recommended_product_name,

            "category": recommended_category,

            "content_score": round(float(score), 4),

            "collaborative_score": round(float(collaborative_score), 4),

            "trending_score": round(float(trend), 4),

            "update_score": round(float(update), 4),

            "frequency_score": round(float(frequency), 4),

            "final_score": round(float(final_score), 4)
        })


    recommendations = sorted(

        recommendations,

        key=lambda x: x['final_score'],

        reverse=True
    )

    return recommendations[:top_n]
