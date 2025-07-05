import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReviewsRoutingModule } from './reviews-routing-module';
import { ReviewList } from './review-list/review-list';
import { AddReview } from './add-review/add-review';


@NgModule({
  declarations: [
    ReviewList,
    AddReview
  ],
  imports: [
    CommonModule,
    ReviewsRoutingModule
  ]
})
export class ReviewsModule { }
