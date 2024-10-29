<?php

/**
 * Plugin Name: Anyclip media
 * Description: Anyclip media plugin inserts playlists.
 * Author: Anyclip R&D team
 * Version: 1.3.3
 * Author URI:  https://anyclip.com
 * Text Domain: inserts
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) {
    die('Invalid request.');
}
require_once(plugin_dir_path(__FILE__) . 'inc/anyclip-admin-settings.php');
require_once(plugin_dir_path(__FILE__) . 'inc/anyclip-media-const.php');
require_once(plugin_dir_path(__FILE__) . 'inc/anyclip-media-block.php');
require_once(plugin_dir_path(__FILE__) . 'inc/anyclip-recommended-block.php');
require_once(plugin_dir_path(__FILE__) . 'inc/anyclip-video-block.php');
require_once(plugin_dir_path(__FILE__) . 'inc/anyclip-media-classic-editor.php');
require_once(plugin_dir_path(__FILE__) . 'inc/anyclip-video-classic-editor.php');
require_once(plugin_dir_path(__FILE__) . 'inc/anyclip-recommended-classic-editor.php');
