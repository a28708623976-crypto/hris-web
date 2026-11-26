import Foundation
import AppKit
import PDFKit

for path in CommandLine.arguments.dropFirst() {
    guard let document = PDFDocument(url: URL(fileURLWithPath: path)) else { fatalError("Invalid PDF: \(path)") }
    for index in 0..<document.pageCount {
        guard let page = document.page(at: index),
              let tiff = page.thumbnail(of: NSSize(width: 1240, height: 1754), for: .mediaBox).tiffRepresentation,
              let bitmap = NSBitmapImageRep(data: tiff),
              let png = bitmap.representation(using: .png, properties: [:]) else { fatalError("Render failed") }
        try png.write(to: URL(fileURLWithPath: "\(path)-page-\(index + 1).png"))
    }
    print("Rendered \(document.pageCount) page(s): \(path)")
}
