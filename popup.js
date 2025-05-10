function limpiar_link(){

    chrome.storage.local.remove("link_v", function () {
        console.log("link_v eliminado correctamente, varaible limpia para nueva captura");
    });
}

function enviar_a_servidor(host, titulo_p, descripcion_p, categorias_p, link_media_p,id_user_p) {

  
    const formData = new FormData();
    formData.append('titulo_reddit', titulo_p);
    formData.append('descripcion_reddit', descripcion_p);
    formData.append('categorias_reddit', categorias_p.join());
    formData.append('link_media_reddit', link_media_p);
    formData.append('id_user',id_user_p);

    document.querySelector('#loading').style.display="block";

    fetch(host, {
        method: 'POST',
        body: formData
    })
    .then(response => {

      alert(response.status);
        if (!response.ok) {
            throw new Error(`Error en la respuesta: ${response.status}`);
        }
        return response.text();
    })
    .then(data => {
        //alert('Respuesta del servidor: '+ data);
        console.log('Respuesta del servidor:', data);
        document.querySelector('#loading').style.display="none";
        alert("Carga exitosa");
    })
    .catch(error => {
        console.error('Error al enviar al servidor:', error);
    });
}


document.addEventListener('DOMContentLoaded', () => {

      //Limpiando Local Storage para asignar nuevo link de decarga....
      limpiar_link();
        //Abriendo archivo de configuración
      fetch('config.json').then(
        response => response.json()).then(data=>{

            document.querySelector('#id_user').value = data.id_user;
            document.querySelector('#host').value = data.host;
        });


  const btn = document.getElementById('capturar_link');

  btn.addEventListener('click', () => {
    // Consulta la pestaña activa
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      let body;
      
      // Inyecta un script para capturar el texto del body de la pestaña actual
      chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: () => {
           let data =  JSON.parse(document.body.innerText);
           //alert(data[0].data.children[0].data.secure_media.reddit_video.dash_url);
           let link_media =  data[0].data.children[0].data.secure_media.reddit_video.dash_url;

          chrome.storage.local.set({ link_v:link_media}, function () {
            console.log("link guardado con exito");
          });


          // alert(`LINK: ${link} TITUL: ${titulo} descripcion ${descripcion}`);
     
           // Captura las categorías seleccionadas
           const categorias = [];
           document.querySelectorAll('input[name="categoria[]"]:checked').forEach(cb => {
             categorias.push(cb.value);
           });
     

        }
      });



      chrome.storage.local.get(["link_v"], function (result) {

         /// alert("Link "+result.link_v);
          if(result.link_v!==null){

            document.getElementById('get_link').value = result.link_v;

          }else{

             document.getElementById('get_link').value = 'Pulse capturar link nuevamente.';
          }

      });
      


      // Si necesitas redirigir la pestaña al JSON de esa página:
      const currentUrl = currentTab.url;
      const newUrl = currentUrl.endsWith('/.json') ? currentUrl : currentUrl + '/.json';
      // Si la URL no termina con '/.json', se redirige
      if (newUrl !== currentUrl) {
        chrome.tabs.update(currentTab.id, { url: newUrl });


      }else{

          document.querySelector('capturar_link').innerText = 'Enviar a servidor';
      }

      // Captura los datos del formulario



      // Muestra los datos capturados en la consola


    });
  });

      document.querySelector('#transferir_v').addEventListener('click',function(){


      // Captura las categorías seleccionadas
        let categorias = [];
        document.querySelectorAll('input[name="categoria[]"]:checked').forEach(cb => {
          categorias.push(cb.value);
        });

        let host = 'https://videosegg.com/download_reddit_ext.php';

        let link = document.getElementById('get_link')?.value.trim();
        let titulo = document.getElementById('titulo')?.value.trim();
        let descripcion = document.getElementById('descripcion')?.value.trim();
        let id_user = document.getElementById('id_user')?.value.trim();
      
        //alert(`TITUL: ${titulo} descripcion ${descripcion} categorias ${categorias.join(', ')}`);

        enviar_a_servidor(host, titulo, descripcion, categorias,link,id_user);
        limpiar_link();
    

      });


});
