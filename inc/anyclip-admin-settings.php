<?php

if (!defined('ABSPATH')) {
    die('Invalid request.');
}

/**
 * @internal never define functions inside callbacks.
 * these functions could be run multiple times; this would result in a fatal error.
 */

/**
 * custom option and settings
 */
function anyclip_settings_init() {
    // Register a new setting for "anyclip" page.
    register_setting( 'anyclip', 'anyclip_platform_ui' );
    register_setting( 'anyclip', 'anyclip_platform_api' );
    add_filter( 'plugin_action_links', 'add_plugin_link', 10, 2 );
    // Register a new section in the "anyclip" page.
    add_settings_section(
        'anyclip_section_developers',
        __( 'Settings', 'anyclip' ), 'anyclip_section_developers_callback',
        'anyclip'
    );

    add_settings_field(
        'anyclip_platform_ui', // As of WP 4.6 this value is used only internally.
                                // Use $args' label_for to populate the id inside the callback.
            __( 'Platform UI', 'anyclip' ),
        'anyclip_field_ui',
        'anyclip',
        'anyclip_section_developers',
        array(
            'label_for_ui'         => 'anyclip_platform_ui'
        )
    );
    add_settings_field(
        'anyclip_field_panyclip_platform_apiill', // As of WP 4.6 this value is used only internally.
                                // Use $args' label_for to populate the id inside the callback.
            __( 'Platform API', 'anyclip' ),
        'anyclip_field_api',
        'anyclip',
        'anyclip_section_developers',
        array(
            'label_for_api'         => 'anyclip_platform_api'
        )
    );
}

/**
 * Register our anyclip_settings_init to the admin_init action hook.
 */
add_action( 'admin_init', 'anyclip_settings_init' );

/**
 * Add a link to the settings on the Plugins screen.
 */
function add_plugin_link( $plugin_actions, $plugin_file ) {
    $new_actions = array();
    if ( 'anyclip-media/anyclip-media.php' === $plugin_file ) {
        $new_actions['cl_settings'] = sprintf( __( '<a href="%s">Settings</a>', 'comment-limiter' ), esc_url( admin_url( 'admin.php?page=anyclip' ) ) );
    }

    return array_merge( $new_actions, $plugin_actions );
}
/**
 * Custom option and settings:
 *  - callback functions
 */


/**
 * Developers section callback function.
 *
 * @param array $args  The settings array, defining title, id, callback.
 */
function anyclip_section_developers_callback( $args ) {
    ?>
    <p id="<?php echo esc_attr( $args['id'] ); ?>"><?php esc_html_e( 'Don\'t put a "/" at the end', 'anyclip' ); ?></p>
    <?php
}

/**
 * Pill field callbakc function.
 *
 * WordPress has magic interaction with the following keys: label_for, class.
 * - the "label_for" key value is used for the "for" attribute of the <label>.
 * - the "class" key value is used for the "class" attribute of the <tr> containing the field.
 * Note: you can add custom key value pairs to be used inside your callbacks.
 *
 * @param array $args
 */
function anyclip_field_ui( $args ) {
    // Get the value of the setting we've registered with register_setting()
    $platform_ui = get_option( 'anyclip_platform_ui' );
    ?>
    <input type="text" name="anyclip_platform_ui" value="<?php echo !empty( $platform_ui ) ? $platform_ui : 'https://videomanager.anyclip.com'; ?>" size="40">
    <?php
}
function anyclip_field_api( $args ) {
    $platform_api = get_option( 'anyclip_platform_api' );
    ?>
    <input type="text" name="anyclip_platform_api" value="<?php echo ! empty( $platform_api ) ? $platform_api : 'https://videomanager-api.anyclip.com'; ?>" size="40">
    <?php
}

/**
 * Add the top level menu page.
 */
function anyclip_options_page() {
    add_menu_page(
        'AnyClip',
        'AnyClip Options',
        'manage_options',
        'anyclip',
        'anyclip_options_page_html'
    );
}


/**
 * Register our anyclip_options_page to the admin_menu action hook.
 */
add_action( 'admin_menu', 'anyclip_options_page' );


/**
 * Top level menu callback function
 */
function anyclip_options_page_html() {
    // check user capabilities
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    // add error/update messages

    // check if the user have submitted the settings
    // WordPress will add the "settings-updated" $_GET parameter to the url
    if ( isset( $_GET['settings-updated'] ) ) {
        // add settings saved message with the class of "updated"
        add_settings_error( 'anyclip_messages', 'anyclip_message', __( 'Settings Saved', 'anyclip' ), 'updated' );
    }

    // show error/update messages
    settings_errors( 'anyclip_messages' );
    ?>
    <div class="wrap">
        <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
        <form action="options.php" method="post">
            <?php
            // output security fields for the registered setting "anyclip"
            settings_fields( 'anyclip' );
            // output setting sections and their fields
            // (sections are registered for "anyclip", each field is registered to a specific section)
            do_settings_sections( 'anyclip' );
            // output save settings button
            submit_button( 'Save Settings' );
            ?>
        </form>
    </div>
    <?php
}