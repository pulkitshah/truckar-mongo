import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import PartyAutocomplete from "./party-autocomplete";

const PartyFilter = forwardRef((props, ref) => {
  const [filterText, setFilterText] = useState(null);
  const [value, setValue] = React.useState(null);

  // expose AG Grid Filter Lifecycle callbacks
  useImperativeHandle(ref, () => {
    return {
      isFilterActive() {
        return Boolean(value);
      },

      doesFilterPass(params) {
        let passed = true;
        return passed;
      },

      getModel() {
        if (!this.isFilterActive()) {
          return null;
        }
        return value;
      },

      setModel(model) {
        setFilterText(model == null ? null : model.value);
      },
    };
  });

  useEffect(() => {
    props.filterChangedCallback();
  }, [filterText, value]);

  return (
    <div style={{ padding: 4, width: 500 }}>
      <PartyAutocomplete value={value} setValue={setValue} type="customer" />
    </div>
  );
});

export { PartyFilter };
