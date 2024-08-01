// import React, { createContext, useState } from 'react';

// export const FaxesContext = createContext();

// export const FaxesProvider = ({ children }) => {
//   const [faxes, setFaxes] = useState({ data: [] });

//   const addNewFax = (fax) => {
//     setFaxes((prevFaxes) => ({
//       ...prevFaxes,
//       data: [...prevFaxes.data, fax],
//     }));
//   };

//   return (
//     <FaxesContext.Provider value={{ faxes, setFaxes, addNewFax }}>
//       {children}
//     </FaxesContext.Provider>
//   );
// };
