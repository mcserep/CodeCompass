require([
  'dojo/_base/declare',
  'dojo/dom-attr',
  'dojo/dom-construct',
  'dojo/query!css2',
  'dojo/topic',
  'dijit/layout/BorderContainer',
  'dijit/layout/ContentPane',
  'dijit/form/Button',
  'dijit/Dialog',
  'codecompass/urlHandler',
  'codecompass/viewHandler',
  'codecompass/model'],
function (declare, attr, dom, query, topic, BorderContainer, ContentPane,
  Button, Dialog, urlHandler, viewHandler, model) {

  var Diagram = declare(BorderContainer, {
    constructor : function () {
      this.gutters = false;
      this.style   = 'height: 100%';

      this._subscribeTopics();
    },

    postCreate : function () {
      var that = this;

      //--- Diagram region ---//

      this._diagCont = new ContentPane({
        region   : 'top',
        splitter : true,
        style    : 'height: 70%; width: 100%;'
      });

      this.addChild(this._diagCont);

      //--- Text region ---//

      viewHandler.getModuleAsync('text').then(function (text) {
        that._textModule = text;
        that._textCont = new ContentPane({
          region : 'center',
          content : that._textModule,
          style : 'padding: 0; border-top: 1px solid gray'
        });

        that.addChild(that._textCont);
      });

      //--- Update on resize ---//

      require(['dojo/aspect'], function (aspect) {
        aspect.after(that._diagCont, 'resize', function () {
          if (that._svgPanZoom)
            that._svgPanZoom.resize();
        });
      });
    },

    loadDiagram : function (handlerId, diagramType, node) {
      var that = this;

      var handler = viewHandler.getModule(handlerId);
      if (!handler) {
        console.warn(handlerId + ' diagram is not registrated.');
        return;
      }

      this._handler = handler;
      this._handlerId = handlerId;
      this._diagramType = diagramType;

      if (window.gtag) {
        window.gtag ('event', 'load_diagram: ' + diagramType.toString(), {
          'event_category' : urlHandler.getState('wsid'),
          'event_label' : urlHandler.getFileInfo().name
        });
      }

      try {
        this._diagCont.set('content', dom.create('span', {
          class : 'diagram-loading'
        }));

        this._handler.getDiagram(diagramType, node, function (svg) {
          if (svg) {
            var svgDom = dom.toDom(svg);
  
            // Remove default browser tooltips.
            // TODO: Sometimes the default browser tooltips are in an <a> tag
            // which contains an xlink:title attribute. This is the case for
            // example in "provides" relation where the provided functions are
            // listed in the tooltip. These should also be placed in a Dojo
            // Tooltip so these can also be removed from the diagram.
            query('.node title', svgDom).forEach(function (node) {
              dom.destroy(node);
            });
  
            query('.edge title', svgDom).forEach(function (node) {
              dom.destroy(node);
            });
  
            query('.graph title', svgDom).forEach(function (node) {
              dom.destroy(node);
            });
  
            that._diagCont.set('content', svgDom);
            that._svg = svg;

            that._setDiagramZoomable();
            that._setMouseEvents();
          } else {
            that._diagCont.set('content', dom.create('div', {
              innerHTML : 'No diagram',
              style : 'margin: 100px 0px 0px 10px;\
                text-align: center;\
                font-weight: bold'
            }));
          }
        });
      } catch (ex) {
        console.error(ex);
        // TODO: Display an error dialog.
      }
    },

    setState : function (state) {
      if ( state.center !== this.id ||
          !state.diagNode ||
          !state.diagType ||
          !state.diagHandler)
        return;

      this.loadDiagram(state.diagHandler, state.diagType, state.diagNode);
    },

    _subscribeTopics : function () {
      var that = this;

      // Opens a diagram and sets the center module to this. Message attributes:
      // - handler: A view handler ID of type Diagram.
      // - diagramType: A diagram type ID. This will be passed to the handler
      //   when fetching the diagram.
      // - node: A node ID to which the diagram belongs.
      topic.subscribe('codecompass/openDiagram', function (message) {
        that.loadDiagram(message.handler, message.diagramType, message.node);

        if (urlHandler.getState('center') !== that.id)
          that._textCont.set('content', that._textModule);

        topic.publish('codecompass/setCenterModule', that.id);

        urlHandler.setStateValue({
          diagNode : message.node,
          diagType : message.diagramType,
          diagHandler : message.handler,
          center : that.id
        });
      });
    },

    _setDiagramZoomable : function () {
      var svgDom = query('svg')[0];

      attr.set(svgDom, { width : '100%', height : '100%' });

      this._svgPanZoom = svgPanZoom(svgDom, {
        fit     : false,
        center  : true,
        maxZoom : Infinity,
        minZoom : 0.1,
        dblClickZoomEnabled : false,
        controlIconsEnabled : true
      });
    },

    _setMouseEvents : function () {
      var that = this;

      var clickPos = { x : 0, y : 0 };
      var isMouseOverSVGElement = false;

      function onMouseOver(svgElement) {
        isMouseOverSVGElement = true;

        setTimeout(function () {
          if (!isMouseOverSVGElement)
            return;

          if (svgElement.id === that._lastMouseoverNodeId)
            return;
          that._lastMouseoverNodeId = svgElement.id;

          var info
            = that._handler.mouseOverInfo(that._diagramType, svgElement.id);

          that._textModule.loadFile(info.fileId);
          that._textModule.set('selection', info.selection);
          that._textModule.jumpToPos(info.selection[0]);
        }, 1000);
      }

      function onMouseOut(svgElement) {
        isMouseOverSVGElement = false;
      }

      //--- Events on nodes ---//

      var nodes = query('.node', this._diagCont.domNode);

      nodes.on('mouseover', function () { onMouseOver(this); });
      nodes.on('mouseout',  function () { onMouseOut(this);  });

      nodes.on('click', function (event) {
        if (clickPos.x !== event.clientX || clickPos.y !== event.clientY)
          return;

        topic.publish('codecompass/openDiagram', {
          handler : that._handlerId,
          diagramType : that._diagramType,
          node : this.id
        });
      });

      nodes.on('mousedown', function (event) {
        clickPos = { x : event.clientX, y : event.clientY };
      });
    }
  });

  var diagram = new Diagram({ id : 'diagram' });
  viewHandler.registerModule(diagram, {
    type : viewHandler.moduleType.Center
  });

  var legendButton = new Button({
    label   : 'Legend',
    render  : function () { return this; },
    onClick : function () {
      if (!urlHandler.getLanguageService())
        return;

      var diagramType = urlHandler.getState('diagType');
      var handlerId   = urlHandler.getState('diagHandler');

      var handler = viewHandler.getModule(handlerId);
      var legend = handler.getDiagramLegend(diagramType);

      new Dialog({
        title   : 'Diagram Legend',
        content : legend || '<b>No Legend</b>',
        style   : legend ? '' : 'width: 200px'
      }).show();
    }
  });

  viewHandler.registerModule(legendButton, {
    type     : viewHandler.moduleType.ContextButton,
    priority : 20,
    center   : 'diagram'
  });

  var textViewButton = new Button({
    label   : 'Text View',
    render  : function () { return this; },
    onClick : function () {
      var fileInfo = urlHandler.getFileInfo();
      topic.publish('codecompass/openFile', {
        fileId : fileInfo.id
      });
    }
  });

  viewHandler.registerModule(textViewButton, {
    type     : viewHandler.moduleType.ContextButton,
    priority : 25,
    center   : 'diagram'
  });

  var exportToSvgButton = new Button({
    label   : 'Export SVG',
    render  : function () { return this; },
    onClick : function () {
      var w = window.open();
      w.document.body.innerHTML = diagram._svg;
      w.document.title = "CodeCompass Export SVG";
    }
  });

  viewHandler.registerModule(exportToSvgButton, {
    type     : viewHandler.moduleType.ContextButton,
    priority : 30,
    center   : 'diagram'
  });

  var downloadImageButton = new Button({
    label   : 'Download image',
    render  : function () { return this; },
    onClick : function () {
      var element = document.createElement('a');
      element.setAttribute('href',
          'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(diagram._svg));
      element.setAttribute('download', 'diagram.svg');
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  });

  viewHandler.registerModule(downloadImageButton, {
    type     : viewHandler.moduleType.ContextButton,
    priority : 40,
    center   : 'diagram'
  });
});
