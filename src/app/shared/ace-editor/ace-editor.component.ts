import { Component, AfterViewInit, ViewChild, ElementRef, forwardRef, Input} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
// import Editor = AceAjax.Editor;

declare var ace: any;

@Component({
  selector: 'metron-config-ace-editor',
  templateUrl: 'ace-editor.component.html',
  styleUrls: ['ace-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AceEditorComponent),
      multi: true
    }
  ]
})
export class AceEditorComponent implements AfterViewInit, ControlValueAccessor {

  inputJson: any = '';
  aceConfigEditor: any;
  @Input() type: string = 'JSON';
  @Input() placeHolder: string = 'Enter text here';
  @ViewChild('aceEditor') aceEditorEle: ElementRef;

  private onTouchedCallback;
  private onChangeCallback;

  constructor() {
    ace.config.set('basePath', '/assets/ace');
  }

  ngAfterViewInit() {
    ace.config.loadModule('ace/ext/language_tools',  () => { this.initializeEditor(); });
  }

  writeValue(obj: any) {
    this.inputJson = obj;
    this.setInput();
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean) {
    // TODO set readonly
  }

  initializeEditor() {
    this.aceConfigEditor = this.createEditor(this.aceEditorEle.nativeElement);
    this.addPlaceHolder();
    this.setInput();
  }

  updatePlaceHolderText() {
    let shouldShow = !this.aceConfigEditor.session.getValue().length;
    let node = this.aceConfigEditor.renderer['emptyMessageNode'];
    if (!shouldShow && node) {
      this.aceConfigEditor.renderer.scroller.removeChild(this.aceConfigEditor.renderer['emptyMessageNode']);
      this.aceConfigEditor.renderer['emptyMessageNode'] = null;
    } else if (shouldShow && !node) {
      node = this.aceConfigEditor.renderer['emptyMessageNode'] = document.createElement('div');
      node.textContent = this.placeHolder;
      node.className = 'ace_invisible ace_emptyMessage';
      this.aceConfigEditor.renderer.scroller.appendChild(node);
    }
  }

  addPlaceHolder() {
    this.aceConfigEditor.on('input', () => { this.updatePlaceHolderText(); });
    setTimeout(() => { this.updatePlaceHolderText(); }, 100);
  }

  private createEditor(element: ElementRef) {
    let parserConfigEditor = ace.edit(element);
    parserConfigEditor.getSession().setMode(this.getEditorType());
    parserConfigEditor.getSession().setTabSize(2);
    parserConfigEditor.getSession().setUseWrapMode(true);
    parserConfigEditor.getSession().setWrapLimitRange(72, 72);

    parserConfigEditor.$blockScrolling = Infinity;
    parserConfigEditor.setTheme('ace/theme/monokai');
    parserConfigEditor.setOptions({
      minLines: 10,
      highlightActiveLine: false,
      maxLines: Infinity,
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true
    });
    parserConfigEditor.on('change', (e: any) => {
      this.inputJson = this.aceConfigEditor.getValue();
      this.onChangeCallback(this.aceConfigEditor.getValue());
    });


    return parserConfigEditor;
  }

  private getEditorType() {
      if (this.type === 'GROK') {
        return 'ace/mode/grok';
      }

      return 'ace/mode/json';
  }

  private setInput() {
      if (this.aceConfigEditor && this.inputJson) {
        this.aceConfigEditor.getSession().setValue(this.inputJson);
        this.aceConfigEditor.resize(true);
      }
  }

}
