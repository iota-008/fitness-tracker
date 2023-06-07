const DeleteDocumentFields = ( document ) =>
{

    let updatedDocument = { ...document }

    delete updatedDocument.$collectionId
    delete updatedDocument.$createdAt
    delete updatedDocument.$databaseId
    delete updatedDocument.$id
    delete updatedDocument.$permissions
    delete updatedDocument.$updatedAt

    return updatedDocument;
}

export default DeleteDocumentFields;