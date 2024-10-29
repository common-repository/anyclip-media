<?php

if (!defined('ABSPATH')) {
    die('Invalid request.');
}

function Anyclip_Add_Video_button()
{
    $postShortCodes = Anyclip_Get_Post_shortcode();
    if (isset($postShortCodes['playlistId'])) {
        $playlistId = str_replace('"', '', $postShortCodes['playlistId']);
    } else {
        $playlistId = false;
    }
        add_thickbox();
        $template = <<<acm
    <div id="anyclip-media-content" style="display:none;">
    </div>
    <a id="videoButton" class="thickbox button">
        <span class="dashicons dashicons-format-video" style="vertical-align: text-top"></span>
        AnyClip Video
    </a>
acm;
    
        printf(
            $template, sprintf( // @codingStandardsIgnoreLine
                ANYCLIP_STUDIO_URL . '?mode=wp_video&u= '. ANYCLIP_USER_EMAIL // @codingStandardsIgnoreLine
            )
        );
}

add_action('media_buttons', 'Anyclip_Add_Video_button');
add_filter('admin_enqueue_scripts', 'Anyclip_video');

function Anyclip_video($plugins)
{
    return wp_enqueue_script(
        'anyclip_media',
        plugins_url('../js/anyclip-media-classic.js', __FILE__),
        array('jquery', 'jquery-ui-core', 'jquery-ui-dialog')
    );
}
