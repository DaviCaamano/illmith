const textForDark = '#d3d3d3';
const defaultText = '#ebebeb';
export const colors: any = {
  text: {
    title: textForDark,
    titleGrayed: '#d1d1d1',
    default: defaultText,
  },
  box: {
    header: '#20252b',
    mainBg: '#19212b',
    button: '',
  },
  button: {
    prompt: {
      dark: {
        bg: '#343d48',
        text: textForDark,
        hoverText: '#658096',
        animatedBar: '#edbf35',
      },
      light: {
        bg: '#0a1e3c',
        text: textForDark,
        hoverText: '#0a1e3c',
        animatedBar: '#cfa119',
      },
    },
  },
  input: {
    modal: {
      bg: '#e8f0fe',
      text: defaultText,
    },
    check: {
      bg: '#ccc',
    },
  },
};