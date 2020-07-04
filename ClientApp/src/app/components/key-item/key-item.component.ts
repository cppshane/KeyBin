import { Component, Input, Output, EventEmitter, OnInit, AfterViewChecked, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { KeyItem } from '../../models/key-item.model';
import { KeyGroup } from '../../models/key-group.model';
import { KeyCategory } from '../../models/key-category.model';
import { KeyGroupType } from '../../enums/key-group-type.enum';

@Component({
  selector: 'app-key-item',
  templateUrl: './key-item.component.html',
  styleUrls: ['./key-item.component.css']
})
export class KeyItemComponent implements OnInit, AfterViewChecked {

  constructor(private httpService: HttpService, private ref: ChangeDetectorRef, private element: ElementRef) { }


  // Model

  @Input() parentKeyCategory: KeyCategory;

  _parentKeyGroup: KeyGroup;

  @Input() set parentKeyGroup(value: KeyGroup) {
    this._parentKeyGroup = value;

    this.updateContentVisualState();
  }

  get parentKeyGroup() {
    return this._parentKeyGroup;
  }

  _keyItem: KeyItem;

  @Input() set keyItem(value: KeyItem) {
    this._keyItem = value;

    this.updateContentItems();

    this.updateDescriptionTextAreaVisualState();
  }

  get keyItem() {
    return this._keyItem;
  }

  // Constants

  standardColor = '#2098D1';
  deletionColor = '#8b0000';

  space = String.fromCharCode(32);
  spaceBreak = String.fromCharCode(160);


  // Fields

  @Input() keyItemDisplayStates = [];

  contentItems: Array<string> = [];
  deletionMode = false;

  keyContentGridSpanBorderStyle;
  keyContentDisplayStyle;
  commandContentDisplayStyle;
  descriptionTextAreaHeightStyle = '20px';
  commandContentTextAreaHeightStyle = '24px';

  @ViewChild('descriptionTextArea', { static: false }) descriptionTextArea;
  @ViewChild('commandContentTextArea', { static: false }) commandContentTextArea;


  // Event Emitters

  @Output() keyItemChange = new EventEmitter();


  // Events

  keyContentItemsSpanKeyDown(event) {
    const element: HTMLSpanElement = event.target;

    if (event.key === 'Enter' || event.key === ' ') {
      const content = this.removeSpaces(element.textContent);

      if (content !== '') {
        this.addNewContentItem(content);
        this.stopEvent(event);

        element.textContent = '';
      }
    }

    if (event.key === 'Backspace') {
      if (element.textContent === '') {
        if (this.deletionMode) {
          this.deleteContentItem();
        }

        this.deletionMode = !this.deletionMode;
      }
    }
    else {
      if (this.deletionMode) {
        this.deletionMode = false;
        this.stopEvent(event);

        element.textContent = '';
      }
    }
  }

  keyItemDescriptionChange() {
    this.updateDescriptionTextAreaVisualState();

    this.keyItemChange.emit();
  }

  commandContentChange() {
    this.updateCommandContentTextAreaVisualState();

    this.keyItemChange.emit();
  }

  deleteKeyItemButtonClick() {
    this.httpService.deleteKeyItem(this.parentKeyCategory.Id, this.parentKeyGroup.Id, this.keyItem.Id);
  }

  ngOnInit() {
    this.updateKeyContentGridSpanVisualState();
  }

  ngAfterViewChecked() {
    this.updateDescriptionTextAreaVisualState()
    this.ref.detectChanges();
  }


  // Binding Functions

  getKeyContentItemColor(index: number) {
    if (this.deletionMode && index === this.contentItems.length - 1) {
      return this.deletionColor;
    }
    else {
      return this.standardColor;
    }
  }


  // Functions

  updateKeyContentGridSpanVisualState() {
    if (this.parentKeyGroup.KeyGroupType === KeyGroupType.Command)
      this.keyContentGridSpanBorderStyle = 'none';
    else {
      if (this.keyItem.Content === '') {
        this.keyContentGridSpanBorderStyle = 'thin solid';
      }
      else {
        this.keyContentGridSpanBorderStyle = 'none';
      }
    }
  }

  addNewContentItem(contentItem: string) {
    if (this.keyItem) {
      this.keyItem.Content += (this.keyItem.Content === '' ? '' : ' ') + contentItem;
    
      this.updateContentItems();

      this.updateKeyContentGridSpanVisualState();

      this.keyItemChange.emit();
    }
  }

  deleteContentItem() {
    if (this.keyItem) {
      this.keyItem.Content = this.keyItem.Content.substr(0, this.keyItem.Content.lastIndexOf(' '));
    
      this.updateContentItems();

      this.updateKeyContentGridSpanVisualState();

      this.keyItemChange.emit();
    }
  }

  updateContentItems() {
    if (this.keyItem) {
      this.contentItems = this.keyItem.Content.split(' ');
    
      if (this.contentItems[0] === '') {
        this.contentItems = [];
      }
    }
  }

  updateDescriptionTextAreaVisualState() {
    if (this.descriptionTextArea !== undefined) {
      this.descriptionTextAreaHeightStyle = '0px';
      this.ref.detectChanges();
      this.descriptionTextAreaHeightStyle = this.descriptionTextArea.nativeElement.scrollHeight + 'px';
    }
  }

  updateCommandContentTextAreaVisualState() {
    if (this.commandContentTextArea !== undefined) {
      this.commandContentTextAreaHeightStyle = '0px';
      this.ref.detectChanges();
      this.commandContentTextAreaHeightStyle = this.commandContentTextArea.nativeElement.scrollHeight + 'px';
    }
  }

  updateContentVisualState() {
    if (this.parentKeyGroup.KeyGroupType === KeyGroupType.Key)
      this.commandContentDisplayStyle = 'none';
    else
      this.keyContentDisplayStyle = 'none';
  }

  removeSpaces(str) {
    return str
      .split(String.fromCharCode(160)).join('')
      .split(String.fromCharCode(32)).join('');
  }

  stopEvent(event) {
    event.stopPropagation();
    event.preventDefault();
    event.cancelBubble = true;
  }
}
