(function() {
    let currentAttrs;

    tinymce.PluginManager.add('anyclip-media', function(editor, url) {
        var sh_tag = 'anyclip-media';
 
        function replaceShortcodes(content) {
            return content.replace(/\[anyclip-media([^\]]*)\]([^\]]*)\[\/anyclip-media\]/g, function(all, attr, con) {
                currentAttrs = attr;
                return `<iframe class="anyclip-media" scrolling="no" id="anyclip-media" data-content="'+ ${btoa(attr)} +'" ></iframe>`;
            });
        }
 
        function restoreShortcodes(content) {
            return content.replace(/\<iframe.*anyclip\-media.*\<\/iframe\>/g, function(match) {
                return '[anyclip-media ' + currentAttrs + '][/anyclip-media]';
            });
        }
 
        //replace from shortcode to an image placeholder
        editor.on('BeforeSetcontent', function(event){
            event.content = replaceShortcodes(event.content);
        });

        editor.on('PostProcess', (event) => {
            if (currentAttrs) {

                let params = {};
                currentAttrs.trim().split(' ').forEach((el) => {
                    const e = el.split('=');
                    params[e[0]] = e[1];
                });

                let acLogo = `<img style="position:absolute; top:5px; left:5px; opacity: 0.7;" src="${url}/../css/AnyClip-graystyle.png"/>`;

                let acContent = `${acLogo}"<img style=\"width: 100%;\" src="${params.thumbnail}"/>"`;

                const iframeElement = document.querySelector('iframe#content_ifr').contentDocument.body.querySelector('iframe.anyclip-media');
                if (iframeElement) {
                    iframeElement.contentDocument.innerHTML = acContent; // @codingStandardsIgnoreLine
                } else iframeElement.contentDocument.innerHTML = null;
            }
        });
 
        //replace from image placeholder to shortcode
        editor.on('GetContent', function(event) {
            event.content = restoreShortcodes(event.content);
        });        
    });
})();
