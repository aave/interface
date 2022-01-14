import css from 'styled-jsx/css';

/*language=SCSS*/
const staticStyles = css.global`
  @import 'src/_mixins/vars';
  @import 'src/_mixins/screen-size';

  .ConnectWalletWrapper {
    &.ReactModal__Content {
      padding: 50px !important;
      max-width: 950px !important;
      @include respond-to(xl) {
        max-width: 750px;
      }
      @include respond-to(md) {
        padding: 50px 10px 30px !important;
      }
    }

    &__inner {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }

    &__caption-inner {
      margin-bottom: 50px;
      @include respond-to(xl) {
        margin-bottom: 30px;
      }
      h2 {
        font-size: $large;
        @include respond-to(xl) {
          font-size: $regular;
        }
      }
    }
  }

  @media only screen and (max-height: 770px) and (min-width: 1024px) {
    .ConnectWalletWrapper.ReactModal__Content.ReactModal__Content--after-open {
      position: absolute !important;
      top: 5% !important;
      bottom: 5% !important;
      display: block;
      overflow: auto !important;
    }
  }

  @media (max-height: 750px) and (max-width: 1023px) {
    .ConnectWalletWrapper.ReactModal__Content.ReactModal__Content--after-open {
      position: absolute !important;
      top: 5% !important;
      bottom: 5% !important;
      display: block;
      overflow: auto !important;
    }
  }

  @media (max-height: 900px) and (max-width: 767px) {
    .ConnectWalletWrapper.ReactModal__Content.ReactModal__Content--after-open {
      position: absolute !important;
      top: 5% !important;
      bottom: 5% !important;
      display: block;
      overflow: auto !important;
    }
  }
`;

export default staticStyles;
