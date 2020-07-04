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

    if (this._keyGroup.KeyGroupType === KeyGroupType.Key)
      this.keyGroupWrapperWidthStyle = '300px';
    else if (this._keyGroup.KeyGroupType === KeyGroupType.Command)
      this.keyGroupWrapperWidthStyle = '465px';
  }

  get keyGroup() {
    return this._keyGroup;
  }


  // Fields

  @Input() keyItemDisplayStates = [];

  keyGroupWrapperWidthStyle;


  // Event Emitters

  @Output() keyGroupChange = new EventEmitter();


  // Events

  keyGroupTitleChange() {
    this.keyGroupChange.emit();
  }

  keyItemChange() {
    this.keyGroupChange.emit();
  }

  deleteKeyItem(keyItem) {
    const index = this.keyGroup.KeyItems.findIndex(item => keyItem === item);

    if (index !== -1) {
      this.keyGroup.KeyItems.splice(index, 1);

      this.keyGroupChange.emit();
    }
  }

  createItemButtonClick() {
    this.httpService.createKeyItem(this.parentKeyCategory.Id, this.keyGroup.Id);
  }

  deleteKeyGroupButtonClick() {
    this.httpService.deleteKeyGroup(this.parentKeyCategory.Id, this.keyGroup.Id);
  }
}
