const IsValidInput = ( user: any ) =>
{

    var invalidField = false;
    var keys = Object.keys( user );

    for ( var i = 0; i < keys.length; i++ )
    {
        if ( keys[i] === 'UserId' ) continue;

        if ( !user[keys[i]].trim() )
        {
            invalidField = true;
        }
        if ( invalidField )
            return keys[i];
    }
    return "";
}

export default IsValidInput;
