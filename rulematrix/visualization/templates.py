import jinja2

# RequireJS template.  If requirejs and jquery are not defined, this will
# result in an error.  This is suitable for use within the IPython notebook.
VIS_HTML = jinja2.Template("""
<div id={{ id }}></div>
<script type="text/javascript">

function add_css(url) {
    var ss = document.styleSheets;
    for (var i = 0, max = ss.length; i < max; i++) {
        if (ss[i].href == url)
            return;
    }
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;

    document.getElementsByTagName("head")[0].appendChild(link);
}

add_css("{{ rulematrix_css_url }}");
</script>
""")


render_scripts = jinja2.Template("""
<script type="text/javascript">

var {{ id }}_model = {{ model_json }};
var {{ id }}_stream = {{ stream_json }};
var {{ id }}_support = {{ support_json }};

function start() {
    var styles = {
        flowWidth: 30,
        // mode: 'matrix',
        rectWidth: 45,
        rectHeight: 27,
        color: rulematrix.labelColor,
        displayEvidence: true,
        height: 1000,
        width: 1000,
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
    var model = new rulematrix.RuleList({{ id }}_model);
    var streams;
    if (rulematrix.isConditionalStreams({{ id }}_stream)) {
        streams = rulematrix.createConditionalStreams({{ id }}_stream);
    } else {
        streams = rulematrix.createStreams({{ id }}_stream);
    }
    model.support({{ id }}_support); 
    ReactDOM.render(React.createElement('div', {
        style: {width: 960, height: 720, overflow: 'scroll'}
    }, React.createElement(rulematrix.RuleMatrixApp, {
        model: model, streams: streams, support: {{ id }}_support, styles: styles, input: null, widgets: true,
        width: 960, height: 1000, id: "{{ id }}_svg"
    })), document.getElementById("{{ id }}"));
}


if(typeof(window.rulematrix) === "undefined"){
    require.config({paths: {d3: "{{ d3_url[:-3] }}", 
                            react: "{{ react_url[:-3] }}", 
                            "react-dom": "{{ react_dom_url[:-3] }}",
                            rulematrix: "{{ rulematrix_url[:-3] }}"
                            }});
    require(["d3", "react", "react-dom"], function(d3, React, ReactDOM){
        window.d3 = d3;
        window.React = React;
        window.ReactDOM = ReactDOM;
        require(["rulematrix"], function(rulematrix) {
            window.rulematrix = rulematrix;
            start();
        });
    });
} else {
    start();
}
</script>
""")
