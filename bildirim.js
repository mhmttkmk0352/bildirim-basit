const http = require("http");
const express = require("express");
const app = express();
const port = 7105;

var hersey = {sidler:{}, idler:{}};


httpServer = http.createServer(app);
const io = require("socket.io").listen(httpServer);

app.get("/", (req,res)=>{
    res.send("Ana sayfa");
});

app.get("/bildirim", (req, res)=>{
    if ( req.query && req.query.id && req.query.mesaj && hersey.idler[req.query.id] && hersey.idler[req.query.id].sid ){
        let bildirim = {id:req.query.id, mesaj:req.query.mesaj, sid:hersey.idler[req.query.id].sid};
        io.to(bildirim.sid).emit("bildirim", bildirim);
        res.send( JSON.stringify(bildirim) );
    }else{
        res.send("Mesaj Gönderilemedi");
    }
    
});



sidYoksaEkle=(sid)=>{
    if (!hersey.sidler[sid]){
        hersey.sidler[sid] = {userid: ""}

    }
}

sidYoksaSil=(sid)=>{
    if (hersey.sidler[sid]){
        if ( hersey.sidler[sid].userid ){
            let userid = hersey.sidler[sid].userid;
            delete hersey.idler[userid];
        }

        delete hersey.sidler[sid];
    }
}

io.on("connection", (s)=>{
    console.log( "Bağlandı: "+s.id );
    sidYoksaEkle(s.id);
    s.on("disconnect", ()=>{
        console.log( "Çıkış yapıldı: "+s.id );
        sidYoksaSil(s.id);

        console.log(hersey);
    });

    s.on("adduser", (data)=>{
        console.log("adduser -->data: ");
        console.log(data);

        if (data && data.id && hersey.sidler[s.id]){
            hersey.sidler[s.id].userid = data.id;
            
            if ( !hersey.idler[data.id] ){
                hersey.idler[data.id] = {sid: s.id}
            }
            else{
                hersey.idler[data.id].sid = s.id;
            }
        }
        console.log("adduser -->hersey: ");
        console.log(hersey);
    });

    console.log(hersey);
});

httpServer.listen(port, ()=>{
    console.log("Listening : *"+port);
});
