$.ajaxPrefilter(function (options) {
  if (options.crossDomain && jQuery.support.cors) {
    const http = (window.location.protocol === 'http:' ? 'http:' : 'https:');
    options.url = http + '//cors-anywhere.herokuapp.com/' + options.url;
    //options.url = "http://cors.corsproxy.io/url=" + options.url;
  }
});

const misc = {
  getFileName:(f) => f.split('\\').pop().split('/').pop()
};

function process(){
  const message = $('#message');
  const output = $('#output');
  const file = document.getElementById('file').files[0];
  const lines = [];

  function processLine(i){
    if(i > lines.length) {
      return;
    }
    const id = lines[i];
    $.ajax({
      url: 'https://twitter.com/a/status/'+id,
      type: 'GET',
      headers: {'Access-Control-Allow-Origin': 'https://twitter.com/'},
      dataType: 'html',
      crossDomain: true,
      success: function (html) {
        const content = $(html).find('.js-original-tweet')[0];
        const name = $(content).attr('data-screen-name');
        $(`#${id}`).find('td:first-child').html(`<a href="https://twitter.com/${name}" target="_blank">@${name}</a>`);
        setTimeout(function(){
          processLine(i+1);
        });
      },
      error: function (error) {
        console.error(error);
        setTimeout(function(){
          processLine(i+1);
        });
      }
    });
  }

  if (file) {
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = function (e) {
      try{
        const content = JSON.parse(e.target.result);
        if(content.length && content.length > 0 && content[0].message && content[0].statusId){
          output.show();
          content.forEach(function(line){
              lines.push(line.statusId);

              const text = line.message
                .replace('\n','<br>')
                .replace(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gm,'<a href="$1" target="_blank">$1</a>')
                .replace(/@(\w*)/gm,'<a href="https://twitter.com/$1" target="_blank">@$1</a>');

              output.append(`<tr id="${line.statusId}"><td>...</td><td>${text}</td><td><a href="https://twitter.com/a/status/${line.statusId}" target="_blank">Link</a></td></tr>`);
          });
          setTimeout(function(){
            processLine(0);
          });
        }else{
          message.text('Invalid file format');
        }
      }catch(error){
        console.error(error);
        message.text('Invalid file format');
      }
    };
    reader.onerror = function (e) {
      console.error(e);
      message.text('Error reading file');
    };
  }
}

$(document).ready(function(){
  const fileInput = $('#file');
  const filePreview = $('#filePreview');
  $('#select').click(function(){
    fileInput.click();
  });
  filePreview.click(function(){
    fileInput.click();
  });
  fileInput.on('input', function(){
    filePreview.text(misc.getFileName(fileInput.val()));
  });

  $('#form').submit(function(e){
    e.preventDefault();
    process();
    return false;
  });
});