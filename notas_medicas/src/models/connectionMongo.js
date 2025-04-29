import {MongoClient} from  'mongodb';

const  getConnection = async () => {
    try {
        const mongoUrl = "mongodb://localhost:27017/consultorios";
        const client = await MongoClient.connect(mongoUrl);
        return client.db('consultorios');
    }
    catch{
        console.error('Error al conectar a la base de datos');
    }
};
export {getConnection};