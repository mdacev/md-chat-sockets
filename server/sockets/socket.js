const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const { crearMensajes } = require('../utils/utils');

const usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on( 'entrarChat' , ( data , callback ) => {

        if( !data.nombre || !data.sala){
            return callback({
                error: true,
                msg: 'El Nombre/Sala es requerido.'
            });
        }

        //Conectar a una Sala
        client.join( data.sala );


        let personas = usuarios.agregarPersona( client.id , data.nombre , data.sala );

        client.broadcast.to(data.sala).emit( 'listaPersonas' ,  usuarios.getPersonasPorSala(data.sala));

        
        callback( usuarios.getPersonasPorSala(data.sala) );
    });


    client.on( 'crearMensaje' , (data) => {

        let persona = usuarios.getPersona( client.id );
        let mensaje = crearMensajes( persona.nombre , data.mensaje );
        client.broadcast.to(persona.sala).emit( 'crearMensaje' , mensaje );

    });

    client.on( 'disconnect' , () => {

        let personaBorrada = usuarios.borrarPersona( client.id );

        client.broadcast.to(personaBorrada.sala).emit( 'crearMensaje' ,  crearMensajes( 'Admin' ,  `${personaBorrada.nombre} Abandonó el Chat!!!` ));

        client.broadcast.to(personaBorrada.sala).emit( 'listaPersonas' ,  usuarios.getPersonasPorSala(personaBorrada.sala));
    });

    client.on( 'mensajePrivado' , data => {

        let persona = usuarios.getPersona( client.id);

        client.broadcast.to(data.para).emit( 'mensajePrivado' ,  crearMensajes( persona.nombre , data.mensaje ));

    });
});