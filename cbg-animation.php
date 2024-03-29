<?php

/**
 * Plugin Name: CBG Animation
 * Description: Adds a custom p5.js animation to the WordPress site.
 * Version: 1.0
 * Author: Antonio Guiotto
 */

function cbg_enqueue_scripts()
{
    // Conditionally enqueue the p5.js library and custom script on the front page
    if (is_front_page() || is_home()) {
        wp_enqueue_script('cbg-p5-js', plugin_dir_url(__FILE__) . 'p5.min.js', array(), '1.4.0', false);
        wp_enqueue_script('cbg-animation-script', plugin_dir_url(__FILE__) . 'cbg-animation-script.js', array('cbg-p5-js'), '1.0', false);
    }
}
add_action('wp_enqueue_scripts', 'cbg_enqueue_scripts');
