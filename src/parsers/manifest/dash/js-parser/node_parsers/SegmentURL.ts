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
  ISegmentUrlIntermediateRepresentation,
} from "../../node_parser_types";
import {
  parseByteRange,
  ValueParser,
} from "./utils";

/**
 * Parse a SegmentURL element into a SegmentURL intermediate
 * representation.
 * @param {Element} root - The SegmentURL root element.
 * @returns {Array}
 */
export default function parseSegmentURL(
  root : Element
) : [ISegmentUrlIntermediateRepresentation, Error[]] {
  const parsedSegmentURL : ISegmentUrlIntermediateRepresentation = {};
  const warnings : Error[] = [];
  const parseValue = ValueParser(parsedSegmentURL, warnings);
  for (let i = 0; i < root.attributes.length; i++) {
    const attribute = root.attributes[i];
    switch (attribute.name) {

      case "media":
        parsedSegmentURL.media = attribute.value;
        break;

      case "indexRange":
        parseValue(attribute.value, { asKey: "indexRange",
                                      parser: parseByteRange,
                                      dashName: "indexRange" });
        break;

      case "index":
        parsedSegmentURL.index = attribute.value;
        break;

      case "mediaRange":
        parseValue(attribute.value, { asKey: "mediaRange",
                                      parser: parseByteRange,
                                      dashName: "mediaRange" });
        break;
    }
  }
  return [parsedSegmentURL, warnings];
}
