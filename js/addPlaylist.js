(function ($,Drupal,drupalSettings) {
  $(document).ready(function () {
    // get all playlist for current user
    $('#add-to-playlist').on('click', function () {
      $('#playlists').empty();
      $('#playlists').html('loading ....');
      let video_id = $(this).attr('data-id');
      $.ajax({
        url: '/retrive_playlist',
        type: 'GET',
        dataType: 'json',
        data: {},
        success: function (response) {
          $('#playlists').empty();
          if($('#add_playlist_btn').attr('data-id') == ''){
            $('#add_playlist_btn').attr('data-id',video_id);
          }
          if (response.length < 1) {
            $('#playlists').empty();
            $('#add_playlist_btn').addClass('d-none');
            var add_playlist_form = '<form id="add_playlist_form" >' +
              '<input class="form-control" type="text" id="playlist_name" name="playlist_name" placeholder="playlist name" >' +
              '<input class="form-control" type="hidden" id="video_id" name="video_id" value="' + video_id + '" >' +
              '<input class="btn btn-success mx-1 mt-1" type="submit" value="Create" >' +
              // '<button type="button" class="btn btn-danger" data-dismiss="#add_playlist_form">'+
              '</form>';
            $('#playlists').html(add_playlist_form);
          }else{
            // console.log(response);
            $.each(response, function (index, value) {
              let playlist_id = value["title"] + "_" + value["id"];
              let videos = value["videos"];
              // console.log(videos.indexOf(video_id));
              let button = '';
              if(videos.indexOf(video_id) == -1){
                button = "<input type='checkbox'  class='exist_playlist mx-1' data-checked-id='empty' data-video-id='" + video_id + "' data-id='" + value["id"] + "' value= '"+ value["title"] +"'>" + value["title"] +"<br>";
              }else{
                button = "<input type='checkbox' checked class='exist_playlist mx-1' data-checked-id='checked' data-video-id='" + video_id + "' data-id='" + value["id"] + "' value= '"+ value["title"] +"'>" + value["title"] +"<br>";
              }
              $('#playlists').append(button);
            });
          }
        }
      });
    });
    // Add to exist playlist.
    $(document).on('click', '.exist_playlist', function () {
      let checked = $(this).attr('data-checked-id');
      let playlist_id = $(this).attr('data-id');
      let video_id = $(this).attr('data-video-id');
      // console.log(playlist_id,video_id);
      $.ajax({
        url: '/video/' + video_id,
        type: 'POST',
        dataType: 'json',
        data: {'playlist': playlist_id , 'checked':checked},
        success: function (response) {
          // console.log(response);
          if (response) {
            $('#playlists').empty();
            $('#playlists').html(response['message']);
            $('#addPlaylist').modal('hide');
            $('#alert_message').html("");
            $('#aleret_block').removeClass("d-none");
            if (checked == 'checked'){
              let urlPath = window.location.pathname.substring(1);
              if( urlPath == 'watch'){
                let p_id = getUrlParameter("playlist");
                let v_id = getUrlParameter("video_id");
                if ( video_id == v_id && playlist_id == p_id) {
                  if ($("#block-views-block-video-watch-block-1 div .view-video-watch .view-content .row > div").length == 1) {
                    var url = window.location.origin + '/user';
                    location.href = url.toString();
                  }else {
                    let a =$("#block-views-block-video-watch-block-1 div .view-video-watch .view-content .row div:first article .node__content .card-container a");
                    var sPageURL = '/watch'+window.location.search ;
                    if (sPageURL == a.attr('href')){
                      let b = $("#block-views-block-video-watch-block-1 div .view-video-watch .view-content .row div:nth-child(2) article .node__content .card-container a");
                      var url = window.location.origin + b.attr('href');
                      location.href = url.toString();
                    }else{
                      var url = window.location.origin + a.attr('href');
                      location.href = url.toString();
                    }
                  }
                }
              }
              $('#aleret_block').removeClass("alert-success");
              $('#aleret_block').addClass("alert-warning");
              $('#alert_message').html(" Removed succesfully");
            }else {
              $('#aleret_block').removeClass("alert-warning");
              $('#aleret_block').addClass("alert-success");
              $('#alert_message').html(" Updated succesfully");
            }
            setTimeout(function () {
              $('#aleret_block').addClass('d-none')
            },3000);
          }
        }
      });
    });
    // Insert form inside Modal.
    $('#add_playlist_btn').on('click', function () {
      let video_id = $(this).attr('data-id');
      // console.log(video_id);
      $('#playlists').empty();
      var add_playlist_form = '<form id="add_playlist_form" >' +
        '<input class="form-control" type="text" id="playlist_name" name="playlist_name" placeholder="playlist name" >' +
        '<input class="form-control" type="hidden" id="video_id" name="video_id" value="' + video_id + '" >' +
        '<input class="btn btn-success mx-1 mt-1" type="submit" value="Create" >' +
        '<input class="btn btn-danger mt-1" type="button" value="Close" id="form_close" data-close-id="'+video_id+'">' +
        // '<button type="button" class="btn btn-danger" data-dismiss="#add_playlist_form">'+
        '</form>';
      $('#playlists').html(add_playlist_form);
    });
    // Create new playlist .
    $(document).on('submit', '#add_playlist_form', function (event) {
      event.preventDefault();
      // console.log($(this).serializeArray());
      var data = $(this).serializeArray();
      let name = data[0]['value'];
      let id = data[1]['value'];
      // console.log(name)
      $.ajax({
        url: '/video/' + name + '/' + id,
        type: 'POST',
        dataType: 'json',
        data: {},
        success: function (response) {
          // console.log(response);
          if (response) {
            $('#add_playlist_btn').removeClass('d-none');
            $('#add_playlist_form').remove();
            $('#playlists').empty();
            $('#playlists').html(response['message']);
            $('#addPlaylist').modal('hide');
            $('#alert_message').html("");
            $('#aleret_block').removeClass("d-none");
            $('#aleret_block').removeClass("alert-warning");
            $('#aleret_block').addClass("alert-success");
            $('#alert_message').html(" Playlist created succesfully");
            setTimeout(function () {
              $('#aleret_block').addClass('d-none')
            },3000);
            // $('#add_icon').data('data-id',id).element('span').text('playlist_add_check');
          }
        }
      });
      // do something
    });
    // Close Form .
    $(document).on('click', '#form_close', function () {
      let video_id = $(this).attr('data-close-id');
      $('#add_playlist_form').remove();
      $('#playlists').empty();
      $('#playlists').html('loading ....');
      $.ajax({
        url: '/retrive_playlist',
        type: 'GET',
        dataType: 'json',
        data: {},
        success: function (response) {
          $('#playlists').empty();
          // console.log(response);
            $.each(response, function (index, value) {
              let playlist_id = value["title"] + "_" + value["id"];
              let videos = value["videos"];
              // console.log(videos.indexOf(video_id));
              let button = '';
              if (videos.indexOf(video_id) == -1) {
                button = "<input type='checkbox'  class='exist_playlist mx-1' data-checked-id='empty' data-video-id='" + video_id + "' data-id='" + value["id"] + "' value= '" + value["title"] + "'>" + value["title"] + "<br>";
              } else {
                button = "<input type='checkbox' checked class='exist_playlist mx-1' data-checked-id='checked' data-video-id='" + video_id + "' data-id='" + value["id"] + "' value= '" + value["title"] + "'>" + value["title"] + "<br>";
              }
              $('#playlists').append(button);
            });
          }
      });
    });
    // append playlist id  to delete modal.
    $(document).on('click', '#remove_playlist', function () {
      let playlist_id = $(this).attr('data-id');
      $('#delete_btn').attr('data-id',playlist_id);
    });
    // Delete playlist.
    $(document).on('click', '#delete_btn', function () {
      let playlist_id = $(this).attr('data-id');
      $('#confirmdelete').modal('hide');
      let tr = "tr_"+playlist_id;
        $.ajax({
            url: '/user/playlist/delete',
            type: 'POST',
            dataType: 'json',
            data: {'playlist': playlist_id },
            success: function (response) {
              $('#remove_block').removeClass("d-none");
              $('#remove_block').removeClass("alert-success");
              $('#remove_block').addClass("alert-danger");
              $("#"+tr).remove();
              $('#remove_block #alert_message').html(" Deleted succesfully");
              setTimeout(function () {
                $('#remove_block').addClass('d-none')
              },3000);
            }
          });
    });
    // Add icon click .
    $(document).on('click','#add_icon', function () {
      $('#playlists').empty();
      $('#playlists').html('loading ....');
      let video_id = $(this).attr('data-id');
      $.ajax({
        url: '/retrive_playlist',
        type: 'GET',
        dataType: 'json',
        data: {},
        success: function (response) {
          $('#playlists').empty();
          if (response.length < 1) {
            $('#playlists').empty();
            $('#add_playlist_btn').addClass('d-none');
            var add_playlist_form = '<form id="add_playlist_form" >' +
              '<input class="form-control" type="text" id="playlist_name" name="playlist_name" placeholder="playlist name" >' +
              '<input class="form-control" type="hidden" id="video_id" name="video_id" value="' + video_id + '" >' +
              '<input class="btn btn-success mx-1 mt-1" type="submit" value="Create" >' +
              // '<button type="button" class="btn btn-danger" data-dismiss="#add_playlist_form">'+
              '</form>';
            $('#playlists').html(add_playlist_form);
          }else{
            // console.log(response);
            $('#add_playlist_btn').attr('data-id',video_id);
            $.each(response, function (index, value) {
              let playlist_id = value["title"] + "_" + value["id"];
              let videos = value["videos"];
              // console.log(videos.indexOf(video_id));
              let button = '';
              if(videos.indexOf(video_id) == -1){
                button = "<input type='checkbox'  class='exist_playlist mx-1' data-checked-id='empty' data-video-id='" + video_id + "' data-id='" + value["id"] + "' value= '"+ value["title"] +"'>" + value["title"] +"<br>";
              }else{
                button = "<input type='checkbox' checked class='exist_playlist mx-1' data-checked-id='checked' data-video-id='" + video_id + "' data-id='" + value["id"] + "' value= '"+ value["title"] +"'>" + value["title"] +"<br>";
              }
              $('#playlists').append(button);
            });
          }
        }
      });
    });
    var getUrlParameter = function getUrlParameter(sParam) {
      var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;
      var values = []
      for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
          sParameterName[1] === undefined ? true : values.push(decodeURIComponent(sParameterName[1]));
        }
      }
      return values;
    };
    $(".delete-video").click(function (){
      var video = $(this).attr("video-id");
      var playlist = getUrlParameter("playlist");
      var parent = $(this).parent().parent().parent().parent();
      $.ajax({
        url: '/playlist/'+playlist+'/remove/'+video,
        type: 'POST',
        dataType: 'json',
        success:function (response){
          parent.fadeOut(300,function (){
            parent.remove();
          });
          $('#aleret_block').removeClass("d-none");
          $('#aleret_block').removeClass("alert-warning");
          $('#aleret_block').addClass("alert-success");
          $('#alert_message').html("Video has been deleted");
          let v_id = getUrlParameter("video_id");
          if (video == v_id) {
            if ($("#block-views-block-video-watch-block-1 div .view-video-watch .view-content .row > div").length == 1) {
              var url = window.location.origin + '/user';
              location.href = url.toString();
            } else {
              let a = $("#block-views-block-video-watch-block-1 div .view-video-watch .view-content .row div:first article .node__content .card-container a");
              var sPageURL = '/watch' + window.location.search;
              if (sPageURL == a.attr('href')) {
                let b = $("#block-views-block-video-watch-block-1 div .view-video-watch .view-content .row div:nth-child(2) article .node__content .card-container a");
                var url = window.location.origin + b.attr('href');
                location.href = url.toString();
              } else {
                var url = window.location.origin + a.attr('href');
                location.href = url.toString();
              }
            }
          }
        }
      })
    });

  });
})(jQuery, Drupal, drupalSettings)
