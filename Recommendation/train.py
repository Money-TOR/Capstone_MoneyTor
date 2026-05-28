import pandas as pd
import numpy as np
import tensorflow as tf
import pickle

from tensorflow.keras.layers import (
    Input,
    Embedding,
    Flatten,
    Dense,
    Dropout,
    Concatenate
)

from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import Callback

from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


BASE_PATH = 'dataset/'

products = pd.read_csv(BASE_PATH + 'Products.csv')
transactions = pd.read_csv(BASE_PATH + 'Transactions.csv')
logs = pd.read_csv(BASE_PATH + 'Logs.csv')

USER_COL = 'id_seller'
PRODUCT_COL = 'id_produk'

user_encoder = LabelEncoder()
product_encoder = LabelEncoder()

transactions['user_encoded'] = user_encoder.fit_transform(
    transactions[USER_COL]
)

transactions['product_encoded'] = product_encoder.fit_transform(
    transactions[PRODUCT_COL]
)


transactions['interaction'] = transactions['qty']

transactions['interaction'] = (
    transactions['interaction'] /
    transactions['interaction'].max()
)


num_users = transactions['user_encoded'].nunique()
num_products = transactions['product_encoded'].nunique()


class DotProductLayer(tf.keras.layers.Layer):

    def call(self, inputs):

        user_vector, product_vector = inputs

        return tf.reduce_sum(
            user_vector * product_vector,
            axis=1,
            keepdims=True
        )


def custom_mse(y_true, y_pred):

    return tf.reduce_mean(
        tf.square(y_true - y_pred)
    )


EMBEDDING_SIZE = 64

user_input = Input(shape=(1,))
product_input = Input(shape=(1,))

user_embedding = Embedding(
    num_users,
    EMBEDDING_SIZE
)(user_input)

product_embedding = Embedding(
    num_products,
    EMBEDDING_SIZE
)(product_input)

user_vector = Flatten()(user_embedding)
product_vector = Flatten()(product_embedding)

dot_product = DotProductLayer()([
    user_vector,
    product_vector
])

concat = Concatenate()([
    user_vector,
    product_vector,
    dot_product
])

dense1 = Dense(128, activation='relu')(concat)
drop1 = Dropout(0.3)(dense1)

dense2 = Dense(64, activation='relu')(drop1)
drop2 = Dropout(0.3)(dense2)

dense3 = Dense(32, activation='relu')(drop2)

output = Dense(1, activation='sigmoid')(dense3)

model = Model(
    inputs=[user_input, product_input],
    outputs=output
)


model.compile(
    optimizer='adam',
    loss=custom_mse,
    metrics=['mae']
)


model.fit(
    [
        transactions['user_encoded'],
        transactions['product_encoded']
    ],

    transactions['interaction'],

    epochs=20,
    batch_size=32
)


model.save('model/hybrid_model.keras')

print("TensorFlow model saved!")


products['combined_features'] = (
    products['nama_produk'] + ' ' +
    products['kategori_produk']
)

tfidf = TfidfVectorizer(stop_words='english')

tfidf_matrix = tfidf.fit_transform(
    products['combined_features']
)

cosine_sim = cosine_similarity(tfidf_matrix)


pickle.dump(
    tfidf,
    open('model/tfidf.pkl', 'wb')
)

pickle.dump(
    cosine_sim,
    open('model/cosine_sim.pkl', 'wb')
)


pickle.dump(
    product_encoder,
    open('model/product_encoder.pkl', 'wb')
)


products.to_csv(
    'model/products.csv',
    index=False
)

transactions.to_csv(
    'model/transactions.csv',
    index=False
)

logs.to_csv(
    'model/logs.csv',
    index=False
)

print("All files saved successfully!")