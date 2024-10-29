<?php

if (!defined('ABSPATH')) {
    die('Invalid request.');
}

const ANYCLIP_ADMIN_PAGE_URL = 'https://anyclip.com';
if(!function_exists('wp_get_current_user')) {
    include(ABSPATH . "wp-includes/pluggable.php"); 
}
$current_user = wp_get_current_user();
$platform_ui = ( ! empty( get_option( 'anyclip_platform_ui', true ) ) ) ? get_option( 'anyclip_platform_ui', true ) : 'https://videomanager.anyclip.com';
$platform_api = ( ! empty( get_option( 'anyclip_platform_api', true ) ) ) ? get_option( 'anyclip_platform_api', true ) : 'https://videomanager-api.anyclip.com';
define("ANYCLIP_STUDIO_URL", $platform_ui . '/studio');
define("ANYCLIP_LOGIN_URL", $platform_ui . '/login');
define("ANYCLIP_API_URL", $platform_api);
define("ANYCLIP_USER_EMAIL", $current_user->user_email);
const ANYCLIP_ASSETS_URL = 'http://plugins.svn.wordpress.org/anyclip-media/assets';

