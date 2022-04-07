import React from "react";
import AsyncSelect from "react-select/async";
import { debounced } from "@dhmk/utils";
import { useStore } from "store";
import { RawPoint, SearchByName } from "types";

type Props = {
  searchProvider: SearchByName;
};

export default function Searchbox({ searchProvider }: Props) {
  const { addPoint } = useStore((s) => s.actions);
  const runSearch = React.useMemo(
    () => debounced(searchProvider, 500),
    [searchProvider]
  );
  const minLength = 3;
  const [input, setInput] = React.useState("");

  return (
    <AsyncSelect<RawPoint>
      isClearable
      loadOptions={async (value) =>
        value.length >= minLength && runSearch(value)
      }
      onChange={(value, { action }) => {
        action === "select-option" && value && addPoint(value);
      }}
      onInputChange={(value, { action }) => {
        action === "input-change" && setInput(value);
      }}
      noOptionsMessage={() =>
        input.length < minLength
          ? `Введите минимум ${minLength} символа...`
          : "Ничего не найдено"
      }
      loadingMessage={() => "Пожалуйста, подождите..."}
      placeholder="Поиск..."
    />
  );
}
