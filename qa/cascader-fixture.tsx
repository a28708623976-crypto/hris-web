import { useState } from "react";
import { createRoot } from "react-dom/client";
import { MultiLevelCascader } from "../src/components/ui/MultiLevelCascader";
import type { CascaderOption } from "../src/types";
import "../src/styles.css";
let deep: CascaderOption = { id: "depth-6", label: "第6级" };
for (let depth = 5; depth >= 1; depth--)
  deep = { id: `depth-${depth}`, label: `第${depth}级`, children: [deep] };
const options = [deep, { id: "direct", label: "直接事项" }];
function Fixture() {
  const [path, setPath] = useState<string[]>([]);
  return (
    <div className="p-8 max-w-xl space-y-4">
      <MultiLevelCascader value={path} onChange={setPath} options={options} />
      <output data-testid="selected-path">{JSON.stringify(path)}</output>
      <button type="button">外部按钮</button>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<Fixture />);
