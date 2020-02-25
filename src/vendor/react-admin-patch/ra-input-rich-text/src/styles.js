import QuillSnowStylesheet from './QuillSnowStylesheet'

export default theme => ({
  '@global': Object.assign({}, QuillSnowStylesheet, {
    'input.ql-image': {
      display: 'none',
    },
    '.ql-showHtml::after': {
      content: '"[source]"',
    },
    '.ql-ad': {
      marginLeft: 20,
    },
    '.ql-ad::after': {
      content: '"[ad]"',
    },
    '.ad-placeholder': {
      fontFamily: 'sans-serif',
      backgroundColor: '#f9f7f7',
      color: '#333333',
      borderRadius: 4,
      marginTop: 15,
      marginRight: 0,
      padding: 20,
      display: 'block',
      textAlign: 'center',
    },
    '.ad-placeholder::after': {
      content: '"Advertisement"',
    },
    '.ql-widget': {
      marginLeft: 0,
    },
    '.ql-widget::after': {
      content: '"[widget]"',
    },
    '.widget-placeholder': {
      fontFamily: 'sans-serif',
      backgroundColor: '#f9f7f7',
      color: '#333333',
      borderRadius: 4,
      marginTop: 15,
      marginRight: 0,
      padding: 20,
      display: 'block',
      textAlign: 'center',
    },

    '.widget-placeholder::after': {
      content: '"Widget " attr(data-id)',
    },

    '.ra-rich-text-input': {
      '& .ql-editor': {
        fontSize: '1rem',
        fontFamily: 'Roboto, sans-serif',
        padding: 0,
        maxWidth: 700,
        overflow: 'scroll',
        height: '65vh',

        '&:hover::before': {
          backgroundColor: 'rgba(0, 0, 0, 1)',
          height: 2,
        },

        '&::before': {
          left: 0,
          right: 0,
          bottom: 0,
          height: 1,
          content: '""',
          position: 'absolute',
          transition: 'background-color 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
          backgroundColor: 'rgba(0, 0, 0, 0.42)',
        },

        '&::after': {
          left: 0,
          right: 0,
          bottom: 0,
          height: 2,
          content: '""',
          position: 'absolute',
          transform: 'scaleX(0)',
          transition: 'transform 200ms cubic-bezier(0, 0, 0.2, 1) 0ms',
          backgroundColor: theme.palette.primary.main,
        },

        '& p:not(:last-child)': {
          marginBottom: '1rem',
        },

        '& strong': {
          fontFamily: 'SanFranciscoText-Semibold',
          fontSize: '14px',
          lineHeight: '24px',
          color: 'rgb(76, 82, 91)',
        },

        '& em': {
          fontFamily: 'SanFranciscoText-LightItalic',
          fontSize: '14px',
          lineHeight: '24px',
          color: 'rgb(131, 146, 167)',
        },

        '& h1, h2, h3': {
          fontFamily: 'SanFranciscoText-Medium',
          fontSize: '14px !important',
          color: 'rgb(59, 72, 89)',
          margin: '20px 0 7px',
          fontWeight: 'normal !important',
        },

        '& a': {
          color: 'rgb(41, 123, 237)',
        },

        '&:focus::after': {
          transform: 'scaleX(1)',
        },

        '& li, p': {
          fontFamily: 'SanFranciscoText-Light',
          fontSize: '14px',
          lineHeight: '24px',
          color: 'rgb(9, 16, 26)',
          margin: '0 !important',
          padding: '0 !important',
          marginBottom: '15px !important',
        },

        '& ul, ol': {
          margin: '0 !important',
          padding: '0 !important',
        },

        '& ul li::before': {
          backgroundColor: 'rgb(59, 72, 89)',
          margin: '0 !important',
          width: '6px',
          height: '6px',
          borderRadius: '6px',
          content: '""',
          marginRight: '8px !important',
          marginBottom: '1px !important',
        },

        '& ol li::before': {
          color: 'rgb(59, 72, 89)',
          fontFamily: 'SanFranciscoText-Medium',
          margin: '0 !important',
          fontSize: '14px !important',
          marginRight: '8px !important',
        },
      },

      '& .ql-toolbar.ql-snow': {
        margin: '0.5rem 0',
        border: 0,
        padding: 0,
        '& .ql-picker-item.ql-active': {
          color: '#304ffe',
        },
        '& .ql-picker-item:hover': {
          color: '#304ffe',
        },
        '& .ql-picker-item.ql-selected': {
          color: '#304ffe',
        },
        '& .ql-picker-label.ql-active': {
          color: '#304ffe',
        },
        '& .ql-picker-label.ql-selected': {
          color: '#304ffe',
        },
        '& .ql-picker-label:hover': {
          color: '#304ffe',
        },

        '& button:hover .ql-fill': {
          fill: '#304ffe',
        },
        '& button.ql-active .ql-fill': {
          fill: '#304ffe',
        },

        '& button:hover .ql-stroke': {
          stroke: '#304ffe',
        },
        '& button.ql-active .ql-stroke': {
          stroke: '#304ffe',
        },
        '& .ql-picker-label:hover .ql-stroke': {
          stroke: '#304ffe',
        },

        '& .ql-snow .ql-picker.ql-expanded .ql-picker-options': {
          background: '#fff',
          zIndex: 10,
        },

        '& .ql-picker-label': {
          paddingLeft: 0,
        },

        '& + .ql-container.ql-snow': {
          border: 0,
        },
      },
    },
  }),
})
