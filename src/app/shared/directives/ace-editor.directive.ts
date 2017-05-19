import {Directive, ElementRef, EventEmitter, AfterViewInit} from '@angular/core';
// let Range = require("ace/range").Range;
declare var ace: any;
// declare var Range = ace.require('ace/range').Range;
declare var Range: any;
// declare var oop: any;
// declare var event: any;


@Directive({
  selector: '[appAceEditor]',
  inputs: ['text', 'mode', 'theme', 'readOnly', 'options'],
  outputs: ['textChanged', 'editorRef']
})

export class AceEditorDirective implements AfterViewInit {
  editor: any;
  _readOnly: boolean = false;
  _theme: string = 'monokai';
  _mode: string = 'lucene';
  oldVal: string = '';
  textChanged = new EventEmitter();
  editorRef = new EventEmitter();
  closeButton: any;
  mouseEventTimer: number;
  target: any;

  static get parameters() {
    return [[ElementRef]];
  }

  set options(value) {
    this.editor.setOptions(value || {});
  }

  set readOnly(value) {
    this._readOnly = value;
    this.editor.setReadOnly(value);
  }

  set theme(value) {
    this._theme = value;
    this.editor.setTheme(`ace/theme/${value}`);
  }

  set mode(value) {
    this._mode = value;
    this.editor.getSession().setMode(`ace/mode/${value}`);
  }

  set text(value) {
    if(value === this.oldVal) return;
    this.editor.setValue(value);
    this.editor.clearSelection();
    this.editor.focus();
  }

  handleMouseEvent (callback: Function) {
    clearTimeout(this.mouseEventTimer);
    this.mouseEventTimer = setTimeout(() => { callback()}, 500);
    // callback();
  }

  mouseover($event) {
    console.log($event.target.classList);
    if ($event.target.classList.contains("ace_value") || $event.target.classList.contains("ace_keyword") || $event.target.classList.contains("fa-times")) {
      this.handleMouseEvent(() => {
        this.target = $event.target.classList.contains("fa-times") ? $event.target.parentElement : $event.target;
        if(this.target.classList.contains("ace_value")) {
          this.target.classList.add('active');
          this.target.previousSibling.classList.add('active');
          this.target.appendChild(this.closeButton);
          this.editor.renderer.$cursorLayer.element.style.display = 'none';
        }
        if(this.target.classList.contains("ace_keyword")) {
          this.target.classList.add('active');
          this.target.nextSibling.classList.add('active');
          this.target.nextSibling.appendChild(this.closeButton);
          this.editor.renderer.$cursorLayer.element.style.display = 'none';
        }
      });
    }
  }

  mouseout($event) {
    if (this.target) {
      console.log('out');
      this.handleMouseEvent(() => {
        if(this.target.classList.contains("ace_value")) {
          this.target.classList.remove('active');
          this.target.previousSibling.classList.remove('active');
          this.target.removeChild(this.closeButton);
          this.editor.renderer.$cursorLayer.element.style.display = '';
        }
        if(this.target.classList.contains("ace_keyword")) {
          this.target.classList.remove('active');
          this.target.nextSibling.classList.remove('active');
          this.target.nextSibling.removeChild(this.closeButton);
          this.editor.renderer.$cursorLayer.element.style.display = '';
        }

        this.target = null;
      });
    }
  }

  ngAfterViewInit() {
    this.elementRef.nativeElement.querySelector('.ace_content').addEventListener('mouseover', this.mouseover.bind(this));
    this.elementRef.nativeElement.querySelector('.ace_content').addEventListener('mouseout', this.mouseout.bind(this));
  }

  constructor(private elementRef: ElementRef) {
    this.textChanged = new EventEmitter();
    this.editorRef = new EventEmitter();

    const el = elementRef.nativeElement;
    el.classList.add('editor');

    ace.config.set('basePath', '/assets/ace');

    this.editor = ace.edit(el);
    this.editor.$blockScrolling = Infinity;
    this.editor.renderer.setShowGutter(false);
    this.editor.renderer.setScrollMargin(12, 12);
    this.editor.renderer.setShowPrintMargin(false);
    this.editor.setTheme('ace/theme/monokai');
    this.editor.container.style.lineHeight = 1.5;
    this.editor.setOptions({
      minLines: 1,
      highlightActiveLine: false,
      maxLines: Infinity,
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true,
      fontSize: "0.75em"
    });


    setTimeout(() => {
      this.editorRef.next(this.editor);
    });

    this.editor.on('change', () => {
      const newVal = this.editor.getValue();
      if(newVal === this.oldVal) return;
      if(typeof this.oldVal !== 'undefined') {
        this.textChanged.next(newVal);
      }
      this.oldVal = newVal;
    });

    this.closeButton = document.createElement('i');
    this.closeButton.classList.add('fa');
    this.closeButton.classList.add('fa-times');
    // this.editor.on("mouseevent", function(e) {
    //   if(e.domEvent.target.classList.contains("ace_value")){
    //     let elem = e.domEvent.target;
    //     if (elem.classList.contains('active')) {
    //       elem.classList.remove('active');
    //       elem.previousSibling.classList.remove('active');
    //       return;
    //     }
    //     if (!elem.classList.contains('active')) {
    //       elem.classList.add('active');
    //       elem.previousSibling.classList.add('active');
    //       return;
    //     }
    //   }
    //
    //   if(e.domEvent.target.classList.contains("ace_keyword")){
    //     let elem = e.domEvent.target;
    //     if (elem.classList.contains('active')) {
    //       elem.classList.remove('active');
    //       elem.nextSibling.classList.remove('active');
    //       return;
    //     }
    //     if (!elem.classList.contains('active')) {
    //       elem.classList.add('active');
    //       elem.nextSibling.classList.add('active');
    //       return;
    //     }
    //   }
    //
    // });

    this.editor.on("click", function(e) {
      if(e.domEvent.target.classList.contains("fa-times")){
        console.log('here ....');
      }
    });
  }
}