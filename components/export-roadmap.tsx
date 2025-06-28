"use client"

import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export interface Milestone {
    title: string
    difficulty: string
    estimatedDays: number
    completed: boolean
    description: string
    topics: string[]
}

export interface Roadmap {
    title: string
    description: string
    category: string
    totalDays: number
    completedMilestones: number
    totalMilestones: number
    milestones: Milestone[]
}

export const exportRoadmapToPDF = (roadmap: Roadmap) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const contentWidth = pageWidth - margin * 2

    doc.addImage('/ic.png', 'PNG', margin, 15, 40, 15)

  

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.setTextColor(75, 85, 99)
    const descriptionLines = doc.splitTextToSize(roadmap.description, contentWidth - 10)
    doc.text(descriptionLines, pageWidth / 2, 55, { align: 'center', maxWidth: contentWidth - 10 })

    doc.setFontSize(10)
    doc.setTextColor(31, 41, 55)
    doc.text(`Category: ${roadmap.category}`, margin, 70)
    doc.text(`Total Duration: ${roadmap.totalDays} days`, margin, 76)


    doc.setFontSize(18)
    doc.text('Learning Milestones', margin, 110)

  

    autoTable(doc, {
        startY: 115,
        head: [[
            { content: '#', styles: { halign: 'center' as const, cellWidth: 12 } },
            { content: 'Milestone', styles: { cellWidth: 70 } },
            { content: 'Difficulty', styles: { halign: 'center' as const, cellWidth: 25 } },
            { content: 'Duration', styles: { halign: 'center' as const, cellWidth: 25 } },
        ]],
        headStyles: {
            fillColor: [6, 95, 70],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 11
        },
        bodyStyles: {
            fontSize: 10,
            cellPadding: { top: 8, right: 5, bottom: 8, left: 5 }
        },
        theme: 'grid',
        styles: {
            lineColor: [209, 213, 219],
            lineWidth: 0.3
        },
        margin: { left: margin, right: margin }
    })

    let yPos = (doc as any).lastAutoTable.finalY + 15

    roadmap.milestones.forEach((milestone, index) => {
        if (yPos > 250) {
            doc.addPage()
            yPos = margin
        }

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(14)
        doc.setTextColor(6, 95, 70)
        doc.text(`Milestone ${index + 1}: ${milestone.title}`, margin, yPos)
        yPos += 10

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(75, 85, 99)

        const durationText = `Duration: ${milestone.estimatedDays} days`
        const difficultyText = `Difficulty: ${milestone.difficulty}`

        doc.text(durationText, margin + 40, yPos)
        doc.text(difficultyText, margin + 90, yPos)
        yPos += 8

        doc.setFontSize(11)
        doc.setTextColor(31, 41, 55)
        const descLines = doc.splitTextToSize(milestone.description, contentWidth)
        doc.text(descLines, margin, yPos)
        yPos += descLines.length * 6 + 10

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.setTextColor(6, 95, 70)
        doc.text('Key Topics:', margin, yPos)
        yPos += 8

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(31, 41, 55)

        const topicsPerLine = 3
        const topicWidth = contentWidth / topicsPerLine

        for (let i = 0; i < milestone.topics.length; i += topicsPerLine) {
            const lineTopics = milestone.topics.slice(i, i + topicsPerLine)
            let lineY = yPos

            lineTopics.forEach((topic, idx) => {
                doc.text(`• ${topic}`, margin + (idx * topicWidth), lineY)
            })

            yPos += 6
        }

        yPos += 15
    })

    const totalPages = doc.internal.pages.length
    const footerText = `Edumorph Learning Roadmap | ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`

    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(156, 163, 175)

        doc.text(footerText, pageWidth / 2, 290, { align: 'center' })
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, 290, { align: 'right' })

        doc.setDrawColor(209, 213, 219)
        doc.setLineWidth(0.3)
        doc.line(margin, 285, pageWidth - margin, 285)
    }

    doc.save(`Edumorph_Roadmap_${roadmap.title.replace(/\s+/g, '_')}.pdf`)
}