import { Box, BoxProps } from '@chakra-ui/react';

interface svgProps extends BoxProps {
  fillstart?: string;
  fillend?: string;
  alt?: string;
}
const ExclamationBox = (props: svgProps) => {
  const { fillstart, fillend } = props;
  const svgOnlyProps = { ...props };
  delete svgOnlyProps.fillstart;
  delete svgOnlyProps.fillend;
  svgOnlyProps.width = svgOnlyProps.width || '1.5rem';
  svgOnlyProps.height = svgOnlyProps.height || '1.3125rem';
  return (
    <Box
      as={'svg'}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 21"
      {...svgOnlyProps}
    >
      <defs>
        <style>
          {`.cls-1 {
        fill-rule: evenodd;
        fill: url(#linear-gradient);
      }`}
        </style>
        <linearGradient id="linear-gradient" x1="12" y1="21" x2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={fillstart || '#f1ae2b'} />
          <stop offset="1" stopColor={fillend || '#f1ae2b'} />
        </linearGradient>
      </defs>
      <path
        id="Color_Fill_2_copy"
        data-name="Color Fill 2 copy"
        className="cls-1"
        d="M4,0H20a3,3,0,0,1,3,3V18a3,3,0,0,1-3,3H4a3,3,0,0,1-3-3V3A3,3,0,0,1,4,0Zm8,14.837a1.849,1.849,0,1,1-1.849,1.849A1.849,1.849,0,0,1,12,14.837ZM12,2.714A2.379,2.379,0,0,1,14.466,5.18c0,1.111-.822,5.411-0.822,6.575,0,0.417-.817.823-1.644,0.822s-1.644-.4-1.644-0.822c0-1.153-.822-5.483-0.822-6.575A2.646,2.646,0,0,1,12,2.714ZM20,7"
      />
    </Box>
  );
};

export default ExclamationBox;
