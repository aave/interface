import css from 'styled-jsx/css';

/*language=SCSS*/
const staticStyles = css.global`
  @import 'src/_mixins/vars';
  @import 'src/_mixins/screen-size';

  .ConnectWalletModal {
    &__content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      max-width: 825px;
      position: relative;
      z-index: 3;
      @include respond-to(xl) {
        grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
        max-width: 660px;
      }
      @include respond-to(md) {
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 540px;
      }
    }

    &__privacy-inner {
      font-size: $regular;
      margin: 40px auto 0;
      text-align: center;
      max-width: 800px;
      position: relative;
      z-index: 3;
      @include respond-to(xl) {
        font-size: $small;
        max-width: 660px;
      }
      @include respond-to(md) {
        max-width: 530px;
      }
      @include respond-to(sm) {
        margin: 30px auto 0;
        font-size: $medium;
      }
      p {
        margin-bottom: 2px;
        &:first-of-type {
          margin-bottom: 40px;
          @include respond-to(xl) {
            margin-bottom: 30px;
          }
          @include respond-to(sm) {
            font-size: $regular;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            a {
              margin-top: 5px;
            }
          }
        }
      }
      a {
        font-weight: 600;
      }
      a,
      p {
        letter-spacing: 0.2px;
      }
      p {
        margin-bottom: 20px;
        @include respond-to(xl) {
          margin-bottom: 15px;
        }
        &:last-child {
          margin-bottom: 0;
        }
        span {
          font-weight: 600;
        }
      }
    }

    .ConnectWalletModal__warningArea {
      max-width: 800px;
      margin-top: 20px;
      position: relative;
      z-index: 3;
      @include respond-to(xl) {
        max-width: 660px;
      }
      @include respond-to(md) {
        max-width: 530px;
      }
      @include respond-to(sm) {
        display: none;
      }
      .WarningAreaTopLine {
        justify-content: center;
      }
    }

    .ConnectWalletModal__warningArea-mobile {
      display: none;
      @include respond-to(sm) {
        display: block;
        max-width: 345px;
        margin: 0 0 35px;
      }
      .WarningArea__content {
        text-align: center;
      }
    }

    .ConnectWalletModal__LedgerChecklist-mobile {
      display: none;
      @include respond-to(sm) {
        display: block;
        max-width: 330px;
      }
    }
  }
`;

export default staticStyles;
