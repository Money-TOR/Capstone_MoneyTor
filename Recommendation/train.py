import os
import pickle
import datetime

import pandas as pd
import numpy as np
import tensorflow as tf

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


os.makedirs('model', exist_ok=True)
os.makedirs('logs', exist_ok=True)
os.makedirs('checkpoints', exist_ok=True)

BASE_PATH = 'dataset/'

products = pd.read_csv(BASE_PATH + 'Products.csv')
transactions = pd.read_csv(BASE_PATH + 'Transactions.csv')
logs = pd.read_csv(BASE_PATH + 'Logs.csv')

print("=" * 50)
print("DATASET LOADED")
print("=" * 50)

print("Products :", len(products))
print("Transactions :", len(transactions))
print("Logs :", len(logs))

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

print("\n")
print("=" * 50)
print("TOTAL")
print("=" * 50)

print("Total Users :", num_users)
print("Total Products :", num_products)


train_df, test_df = train_test_split(

    transactions,

    test_size=0.2,

    random_state=42
)


BATCH_SIZE = 32

train_dataset = tf.data.Dataset.from_tensor_slices(

    (
        (
            train_df['user_encoded'].values,
            train_df['product_encoded'].values
        ),

        train_df['interaction'].values
    )
)

train_dataset = train_dataset.shuffle(
    10000
).batch(BATCH_SIZE)

test_dataset = tf.data.Dataset.from_tensor_slices(

    (
        (
            test_df['user_encoded'].values,
            test_df['product_encoded'].values
        ),

        test_df['interaction'].values
    )
)

test_dataset = test_dataset.batch(BATCH_SIZE)


@tf.keras.utils.register_keras_serializable()
class DotProductLayer(tf.keras.layers.Layer):

    def call(self, inputs):

        user_vector, product_vector = inputs

        return tf.reduce_sum(
            user_vector * product_vector,
            axis=1,
            keepdims=True
        )


EMBEDDING_SIZE = 64

user_input = tf.keras.layers.Input(
    shape=(1,)
)

product_input = tf.keras.layers.Input(
    shape=(1,)
)


user_embedding = tf.keras.layers.Embedding(

    num_users,

    EMBEDDING_SIZE

)(user_input)

product_embedding = tf.keras.layers.Embedding(

    num_products,

    EMBEDDING_SIZE

)(product_input)

user_vector = tf.keras.layers.Flatten()(
    user_embedding
)

product_vector = tf.keras.layers.Flatten()(
    product_embedding
)

dot_product = DotProductLayer()([

    user_vector,

    product_vector
])


concat = tf.keras.layers.Concatenate()([

    user_vector,

    product_vector,

    dot_product
])


dense1 = tf.keras.layers.Dense(

    128,

    activation='relu'

)(concat)

drop1 = tf.keras.layers.Dropout(0.3)(
    dense1
)

dense2 = tf.keras.layers.Dense(

    64,

    activation='relu'

)(drop1)

drop2 = tf.keras.layers.Dropout(0.3)(
    dense2
)

dense3 = tf.keras.layers.Dense(

    32,

    activation='relu'

)(drop2)

output = tf.keras.layers.Dense(

    1,

    activation='sigmoid'

)(dense3)


model = tf.keras.models.Model(

    inputs=[user_input, product_input],

    outputs=output
)

print("\n")
print("=" * 50)
print("MODEL SUMMARY")
print("=" * 50)

model.summary()


loss_fn = tf.keras.losses.MeanSquaredError()


optimizer = tf.keras.optimizers.Adam(
    learning_rate=0.001
)

train_loss_metric = tf.keras.metrics.Mean()
train_mae_metric = tf.keras.metrics.MeanAbsoluteError()

val_loss_metric = tf.keras.metrics.Mean()
val_mae_metric = tf.keras.metrics.MeanAbsoluteError()


current_time = datetime.datetime.now().strftime(
    "%Y%m%d-%H%M%S"
)

log_dir = f'logs/{current_time}'

train_writer = tf.summary.create_file_writer(
    log_dir + '/train'
)

val_writer = tf.summary.create_file_writer(
    log_dir + '/validation'
)

print("\n")
print("=" * 50)
print("TENSORBOARD")
print("=" * 50)

print("Log Directory :", log_dir)


checkpoint_path = 'checkpoints/best_model.weights.h5'

best_val_loss = np.inf

@tf.function
def train_step(user_batch, product_batch, label_batch):

    with tf.GradientTape() as tape:

        predictions = model(

            [user_batch, product_batch],

            training=True
        )

        predictions = tf.squeeze(
            predictions
        )

        loss = loss_fn(
            label_batch,
            predictions
        )

    gradients = tape.gradient(

        loss,

        model.trainable_variables
    )

    optimizer.apply_gradients(

        zip(
            gradients,
            model.trainable_variables
        )
    )

    train_loss_metric.update_state(
        loss
    )

    train_mae_metric.update_state(
        label_batch,
        predictions
    )


@tf.function
def validation_step(
    user_batch,
    product_batch,
    label_batch
):

    predictions = model(

        [user_batch, product_batch],

        training=False
    )

    predictions = tf.squeeze(
        predictions
    )

    loss = loss_fn(
        label_batch,
        predictions
    )

    val_loss_metric.update_state(
        loss
    )

    val_mae_metric.update_state(
        label_batch,
        predictions
    )


EPOCHS = 20

print("\n")
print("=" * 50)
print("TRAINING START")
print("=" * 50)

for epoch in range(EPOCHS):

    print(f"\nEpoch {epoch+1}/{EPOCHS}")

    train_loss_metric.reset_state()
    train_mae_metric.reset_state()

    val_loss_metric.reset_state()
    val_mae_metric.reset_state()

    for (user_batch, product_batch), label_batch in train_dataset:

        train_step(

            user_batch,

            product_batch,

            label_batch
        )

    for (user_batch, product_batch), label_batch in test_dataset:

        validation_step(

            user_batch,

            product_batch,

            label_batch
        )


    train_loss = train_loss_metric.result()
    train_mae = train_mae_metric.result()

    val_loss = val_loss_metric.result()
    val_mae = val_mae_metric.result()


    with train_writer.as_default():

        tf.summary.scalar(
            'loss',
            train_loss,
            step=epoch
        )

        tf.summary.scalar(
            'mae',
            train_mae,
            step=epoch
        )

    with val_writer.as_default():

        tf.summary.scalar(
            'loss',
            val_loss,
            step=epoch
        )

        tf.summary.scalar(
            'mae',
            val_mae,
            step=epoch
        )

    print(

        f"Train Loss : {train_loss:.4f} | "
        f"Train MAE : {train_mae:.4f}"
    )

    print(

        f"Val Loss   : {val_loss:.4f} | "
        f"Val MAE   : {val_mae:.4f}"
    )

    if val_loss < best_val_loss:

        best_val_loss = val_loss

        model.save(
            'model/hybrid_model.keras'
        )

        model.save_weights(
            checkpoint_path
        )

        print("Best model saved!")


products['combined_features'] = (

    products['nama_produk'].astype(str) + ' ' +

    products['kategori_produk'].astype(str)
)

tfidf = TfidfVectorizer()

tfidf_matrix = tfidf.fit_transform(
    products['combined_features']
)

cosine_sim = cosine_similarity(
    tfidf_matrix
)


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

pickle.dump(

    user_encoder,

    open('model/user_encoder.pkl', 'wb')
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

print("\n")
print("=" * 50)
print("TRAINING FINISHED")
print("=" * 50)

print("Model Saved!")
print("TensorBoard Logs Saved!")
print("Artifacts Saved!")

print("\n")
print("Run TensorBoard:")
print("tensorboard --logdir logs")