<?php

namespace Drupal\pfizergo_addPlaylist\Controller;

use Drupal\Core\Controller\ControllerBase;
use phpDocumentor\Reflection\Type;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\node\Entity\Node;

/**
 * An example controller.
 */
class AddPlaylist extends ControllerBase {

  /**
   * Construct.
   */
  public function __construct() {}

  /**
   * Returns a render-able array for a test page.
   */
  public function index() {
    $currentAccount = \Drupal::currentUser();
    $entities = \Drupal::entityTypeManager()
      ->getStorage('node')
      ->loadByProperties([
        'type' => 'playlist',
        'uid' => $currentAccount->id()
      ]);
    $data = [];
    foreach ($entities as $key => $value) {
      $playlist = [];
      $field_play_list = $value->get('field_playlist_videos')->getValue();
      foreach ($field_play_list as $index => $target) {
        $playlist[] = $target['target_id'];
      }
      $data[] = [
        'id' => $value->get('nid')->getValue()[0]['value'],
        'title' => $value->get('title')->getValue()[0]['value'],
        'videos' => $playlist
      ];
    }
    return new JsonResponse($data);
  }
  /**
   * Returns a render-able array for a test page.
   */
  public function addPlaylist($name, $id) {
    $currentAccount = \Drupal::currentUser();
    $uid = $currentAccount->id();
    $playlist_name = $name;
    $video_id = $id;
    $node = Node::create([
      'type' => 'playlist',
      'title' => $playlist_name,
      'uid' => $uid,
      'field_playlist_videos' => [
        [
        'target_id' => $video_id
        ]
      ]
    ]);
    $save = $node->save();
    if ($save) {
      $response = [
       'status' => 200 ,
       'message' => 'Node created Successfully'
      ];
    }
    else {
      $response = [
        'status' => 500 ,
        'message' => 'could not be created'
      ];
    }
    return new JsonResponse($response);
  }

  /**
   * Returns a render-able array for a test page.
   */
  public function updatePlaylist(Request $request, $video_id) {
    $playlist_id = $request->request->get('playlist');
    $checked = $request->request->get('checked');
    $playlist_id = $playlist_id;
    $video_id = $video_id;
    if ($checked == "checked") {
      // Reomve if exist from playlist.
      $entity = \Drupal::entityTypeManager()->getStorage('node')->load($playlist_id);
      $tids = $entity->get('field_playlist_videos')->getValue();
      $updatedTerms = [];
      foreach ($tids as $term) {
        if ($term['target_id'] != $video_id) {
          $updatedTerms[] = ['target_id' => $term['target_id']];
        }
      }
      $entity->field_playlist_videos = $updatedTerms;
      $save = $entity->save();
    }
    else {
      // Add video to playlist .
      $node = Node::load($playlist_id);
      $node->field_playlist_videos[] = [
        'target_id' => $video_id
      ];
      $save = $node->save();
    }
    if ($save) {
      $response = [
        'status' => 200 ,
        'message' => "node updated successfuly"
      ];
    }
    else {
      $response = [
        'status' => 500 ,
        'message' => "error happend"
      ];
    }
    return new JsonResponse($response);
  }

  /**
   * Returns a render-able array for a test page.
   */
  public function removePlaylist(Request $request) {
    $playlist_id = $request->request->get('playlist');
    // Reomve if exist from playlist.
    $node = \Drupal::entityTypeManager()->getStorage('node')->load($playlist_id);
    if ($node) {
      $node->delete();
      $response = [
        'status' => 200 ,
        'message' => "node deleted successfuly"
      ];
    }
    else {
      $response = [
        'status' => 500 ,
        'message' => "error happend"
      ];
    }
    return new JsonResponse($response);
  }

  /**
   * Delete Video from playlist.
   */
  public function removeVideo($playlistId, $videoId) {
    $playList = Node::load($playlistId);
    $vids = $playList->get('field_playlist_videos')->getValue();
    $videoList = [];
    foreach ($vids as $video) {
      if ($video['target_id'] != $videoId) {
        $videoList[] = ['target_id' => $video['target_id']];
      }
    }
    $playList->field_playlist_videos = $videoList;
    $playList->save();
    return new JsonResponse("Video deleted", 200);
  }

}
