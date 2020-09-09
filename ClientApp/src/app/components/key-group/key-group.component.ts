import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { KeyGroup } from '../../models/key-group.model';
import { KeyCategory } from '../../models/key-category.model';
import { KeyGroupType } from '../../enums/key-group-type.enum';

@Component({
  selector: 'app-key-group',
  templateUrl: './key-group.component.html',
  styleUrls: ['./key-group.component.css']
})
export class KeyGroupComponent {

  constructor(private httpService: HttpService) { }


  // Model

  @Input() parentKeyCategory: KeyCategory;

  _keyGroup: KeyGroup;

  @Input() set keyGroup(value: KeyGroup) {
    this._keyGroup = value;

    if (window.innerWidth < 500) {
      this.keyGroupWrapperWidthStyle = '300px';
    }
    else {
      if (this._keyGroup.KeyGroupType === KeyGroupType.Key)
        this.keyGroupWrapperWidthStyle = '300px';
      else if (this._keyGroup.KeyGroupType === KeyGroupType.Command)
        this.keyGroupWrapperWidthStyle = '375px';
    }
  }

  get keyGroup() {
    return this._keyGroup;
  }


  // Fields

  @Input() set keyGroupFocusState(value: boolean) {
    if (!value) {
      this.focusedKeyItem = null;
    }
  }

  @Input() keyItemDisplayStates = [];

  focusedKeyItem = null;

  keyGroupWrapperWidthStyle;


  // Event Emitters

  @Output() keyGroupChange = new EventEmitter();


  // Events

  onResize() {
    if (window.innerWidth < 500) {
      this.keyGroupWrapperWidthStyle = '300px';
    }
    else {
      if (this._keyGroup.KeyGroupType === KeyGroupType.Key)
        this.keyGroupWrapperWidthStyle = '300px';
      else if (this._keyGroup.KeyGroupType === KeyGroupType.Command)
        this.keyGroupWrapperWidthStyle = '375px';
    }
  }

  keyGroupTitleChange() {
    this.keyGroupChange.emit();
  }

  keyItemChange() {
    this.keyGroupChange.emit();
  }

  keyItemFocus(keyItem) {
    this.focusedKeyItem = keyItem;
  }

  deleteKeyItem(keyItem) {
    const index = this.keyGroup.KeyItems.findIndex(item => keyItem === item);

    if (index !== -1) {
      this.keyGroup.KeyItems.splice(index, 1);

      this.keyGroupChange.emit();
    }
  }

  createItemButtonClick() {
    let newKeyItemIndex = this.keyGroup.KeyItems.findIndex(item => this.focusedKeyItem === item);

    if (newKeyItemIndex !== -1)
      newKeyItemIndex++;

    this.httpService.createKeyItem(this.parentKeyCategory.Id, this.keyGroup.Id, newKeyItemIndex);
  }

  deleteKeyGroupButtonClick() {
    this.httpService.deleteKeyGroup(this.parentKeyCategory.Id, this.keyGroup.Id);
  }
}
