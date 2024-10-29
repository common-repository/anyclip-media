<?php

if (!defined('ABSPATH')) {
    die('Invalid request.');
}

function Anyclip_Get_Post_shortcode()
{
    global $post;
    $result = array();
    //get shortcode regex pattern wordpress function
    $pattern = get_shortcode_regex(['anyclip-media']);
    
    
    if (preg_match_all('/'. $pattern .'/s', $post->post_content, $matches)) {
        $keys = array();
        $result = array();
        foreach ($matches[0] as $key => $value) {
            // $matches[3] return the shortcode attribute as string
            // replace space with '&' for parse_str() function
            $get = str_replace(" ", "&", $matches[3][$key]);
            parse_str($get, $output);
    
            //get all shortcode attribute keys
            $keys = array_unique(array_merge($keys, array_keys($output)));
            $result[] = $output;
        }

        if ($keys && $result) {
            // Loop the result array and add the missing shortcode attribute key
            foreach ($result as $key => $value) {
                // Loop the shortcode attribute key
                foreach ($keys as $attr_key) {
                    $result[$key][$attr_key] = isset($result[$key][$attr_key]) ? $result[$key][$attr_key] : null;
                }
                //sort the array key
                ksort($result[$key]);              
            }
        }
    
        //display the result
        return $result[0];
    
    
    }
    return [];
}

function Anyclip_Add_Media_button()
{
    $postShortCodes = Anyclip_Get_Post_shortcode();
    if (isset($postShortCodes['playlistId'])) {
        $playlistId = str_replace('"', '', $postShortCodes['playlistId']);
    } else {
        $playlistId = false;
    }
    if (!get_the_title()) {
        add_thickbox();
        $template = <<<acm
        <div id="my-modal-id" style="display:none;">
            <p>
                Save post with title before add AnyClip content.
            </p>
        </div>

        <a id="playlistButton" class="thickbox button">
            <span class="dashicons dashicons-playlist-video" style="vertical-align: text-top"></span>
            AnyClip Playlist
        </a> 
acm;
        $template;
    } else {
        add_thickbox();
        $template = <<<acm
    <div id="anyclip-media-content" style="display:none;">
    </div>
    <a id="playlistButton" class="thickbox button">
        <span class="dashicons dashicons-playlist-video" style="vertical-align: text-top"></span>
        AnyClip Playlist
    </a>
acm;
    
        printf(
            $template, // @codingStandardsIgnoreLine
            sprintf(
                ANYCLIP_STUDIO_URL . '?mode=wp&title=%s&playlist=%d', // @codingStandardsIgnoreLine
                get_the_title(),
                $playlistId // @codingStandardsIgnoreLine
            )
        );
    }
}

add_action('media_buttons', 'Anyclip_Add_Media_button');
add_filter('admin_enqueue_scripts', 'Anyclip_js');

function Anyclip_js($plugins)
{
    wp_enqueue_script('anyclip_media', plugins_url('../js/anyclip-media-classic.js', __FILE__), array('jquery', 'jquery-ui-core', 'jquery-ui-dialog'));

    wp_localize_script(
        'anyclip_media', 'constants', array(
        'ANYCLIP_STUDIO_URL' => ANYCLIP_STUDIO_URL,
        'ANYCLIP_ASSETS_URL' => ANYCLIP_ASSETS_URL,
        'ANYCLIP_LOGIN_URL' => ANYCLIP_LOGIN_URL,
        'ANYCLIP_API_URL' => ANYCLIP_API_URL,
        'ANYCLIP_USER_EMAIL' => ANYCLIP_USER_EMAIL
        )
    );

    wp_localize_script(
        'anyclip_media', 'postOptions', array(
        'title' => get_the_title()
        )
    );

    return add_editor_style(plugins_url('../css/anyclip-media.css', __FILE__));    
}

add_filter('Anyclip_Mce_External_plugins', 'Anyclip_Mce_External_plugins');

function Anyclip_Mce_External_plugins($plugin_array)
{
    return $array_merge(
        $plugin_array, [
        'anyclip-media' => plugins_url('../js/anyclip-editor-plugin.js', __FILE__)
        ]
    );
}

function Anyclip_Media_func($atts)
{
    extract(
        shortcode_atts(
            array(
                'thumbnail' => 'no',
                'playlistId' => 'no',
                'content' => false
            ),
            $atts
        )
    );

    return $content ? base64_decode($content) : '';
}

add_shortcode('anyclip-media', 'Anyclip_Media_func');
