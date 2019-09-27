/**
 * Copyright 2015 CANAL+ Group
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  createBox,
  createBoxWithChildren,
} from "../../../parsers/containers/isobmff";
import {
  createSAIOBox,
  createSAIZBox,
} from "./create_boxes";

export default function createTrafBox(
  tfhd : Uint8Array,
  tfdt : Uint8Array,
  trun : Uint8Array,
  mfhd : Uint8Array,
  senc?: Uint8Array
) : Uint8Array {
  const trafs = [tfhd, tfdt, trun];
  if (senc) {
    trafs.push(
      createBox("senc", senc),
      createSAIZBox(senc),
      createSAIOBox(mfhd, tfhd, tfdt, trun)
    );
  }
  return createBoxWithChildren("traf", trafs);
}