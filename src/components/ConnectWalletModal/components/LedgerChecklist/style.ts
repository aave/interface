import css from 'styled-jsx/css';

/*language=SCSS*/
const staticStyles = css.global`
  @import 'src/_mixins/vars';
  @import 'src/_mixins/screen-size';

  .LedgerChecklist.UnlockWallet__warningArea-mobile .WarningArea__content,
  .LedgerChecklist.UnlockWallet__warningArea .WarningArea__content {
    justify-content: flex-start;
    align-items: flex-start;
  }
  .UnlockWallet .LedgerChecklist.UnlockWallet__warningArea {
    .WarningAreaTopLine {
      display: none;
    }
  }

  .LedgerChecklist {
    width: 100%;

    &__topInfo {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      @include respond-to(xl) {
        margin-bottom: 15px;
      }

      a {
        font-size: $medium;
        @include respond-to(xl) {
          font-size: $extraSmall;
        }
        @include respond-to(sm) {
          display: none;
        }
        img {
          width: 10px;
          height: 10px;
          margin-left: 5px;
        }
      }
    }

    &__title {
      font-size: $regular;
      @include respond-to(xl) {
        font-size: $medium;
      }
      @include respond-to(sm) {
        width: 100%;
        text-align: center;
      }
      img {
        width: 18px;
        height: 16px;
        margin-right: 5px;
        position: relative;
        top: 1px;
        @include respond-to(xl) {
          width: 16px;
          height: 14px;
          margin-right: 10px;
        }
      }
    }

    &__checkList {
      display: flex;
      flex-wrap: wrap;
      counter-reset: counter;
      li {
        width: 50%;
        margin-bottom: 10px;
        counter-increment: counter;
        display: flex;
        align-items: center;
        font-size: $regular;
        @include respond-to(xl) {
          font-size: $small;
        }
        @include respond-to(sm) {
          font-size: $medium;
        }
        @include respond-to(xl) {
          margin-bottom: 5px;
        }
        @include respond-to(sm) {
          width: 100%;
          margin-bottom: 10px;
        }
        &:first-of-type {
          order: 0;
        }
        &:nth-of-type(2) {
          order: 2;
          margin-bottom: 0;
          @include respond-to(sm) {
            order: 1;
            margin-bottom: 10px;
          }
        }
        &:nth-of-type(3) {
          order: 1;
          @include respond-to(sm) {
            order: 2;
          }
        }
        &:nth-of-type(4) {
          order: 3;
          margin-bottom: 0;
          @include respond-to(sm) {
            margin-bottom: 15px;
          }
        }

        &:before {
          content: counter(counter);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          margin-right: 5px;
          font-size: 8px;
          @include respond-to(sm) {
            width: 16px;
            height: 16px;
            font-size: $extraSmall;
          }
        }
      }
    }

    &__mobile-link {
      display: none;
      @include respond-to(sm) {
        display: flex;
        align-items: center;
        justify-content: center;
        a {
          font-size: $medium;
          img {
            width: 10px;
            height: 10px;
            margin-left: 5px;
          }
        }
      }
    }
  }
`;

export default staticStyles;
