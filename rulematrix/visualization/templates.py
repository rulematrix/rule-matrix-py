import jinja2

# RequireJS template.  If requirejs and jquery are not defined, this will
# result in an error.  This is suitable for use within the IPython notebook.
REQUIREJS_HTML = jinja2.Template("""
<div id={{ id }}></div>
<script type="text/javascript">
var {{ id }}_model = {{ model_json }};
var {{ id }}_stream = {{ stream_json }};
var {{ id }}_support = {{ support_json }};

if(typeof(window.rulematrix) === "undefined"){
  console.error("Cannot identify rulematrix!")
}

function start() {
    var styles = {
        flowWidth: 30,
        // mode: 'matrix',
        rectWidth: 45,
        rectHeight: 27,
        color: rulematrix.labelColor,
        displayEvidence: true,
        height: 5000,
        width: 5000,
        // displayFidelity: false,
        // displayFlow: false,
        zoomable: false,
    };
    {% if styles is defined and styles is not none %}
        var user_styles = {{ styles }};
        var keys = Object.keys(user_styles);
        for(var j=0; j < keys.length; j += 1) {
            styles[keys[j]] = user_styles[keys[j]];
        }
    {% endif %}
    ReactDOM.render(React.createElement('div', {
        style: {width: 500, height: 500, overflow: 'scroll'}
    }, React.createElement(rulematrix.RuleMatrixApp, {
        model: {{ id }}_model, streams: {{ id }}_stream, support: {{ id }}_support, styles: styles, input: null
    })), document.getElementById("{{ id }}"));
}

start();
</script>
""")


add_script_tags_to_head = jinja2.Template("""
<script type="text/javascript">
function addScript(src) {
    var s = document.createElement( "script" );
    s.setAttribute( "src", src );
    s.setAttribute( "type", "text/javascript" );
    document.head.appendChild( s );
}

function addScripts() {
    if (typeof(window.d3) === "undefined") {
        addScript("{{ d3_url }}");
    }
    if (typeof(window.React) === "undefined") {
        addScript("{{ react_url }}");
    }
    if (typeof(window.ReactDOM) === "undefined") {
        addScript("{{ react_dom_url }}");
    }
    if (typeof(window.rulematrix) === "undefined") {
        addScript("{{ rulematrix_url }}");
    }
}

function addStylesheet() {
    var ss = document.styleSheets;
    for (var i = 0, max = ss.length; i < max; i++) {
        if (ss[i].href == "{{rulematrix_css_url}}")
            return;
    }
    vat r_css = document.createElement("link");
    r_css.setAttribute("rel", "stylesheet");
    r_css.setAttribute("type", "text/css");
    r_css.setAttribute("href", "{{ rulematrix_css_url }}");

}

addScripts();
addStylesheet();
</script>
""")
